#!/usr/bin/env bash

set -uo pipefail

# Ensure the script always runs in the script's directory, no matter where you call it from
readonly SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d ".git" ]; then
	#not running in git repo, so can't use git commands :-)
	echo "No .git repo found - skipping sanity checks"
	exit 0
fi

readonly WARNING='\033[93m'
readonly ENDC='\033[0m'

comment_filter() {
	sed -Ez '
		s|//[^\n]*||g;    # // comment
		s|/\*.*?\*/||g;   # /* comment */
		s|<!--.*?-->||g;  # <!-- comment -->
		/\x1b\[1;31m/!d;  # delete all lines that no longer have a match
	'
}

myprint() {
	while read data; do
		local check_name="$1"
		printf "[%s] %b%s\n\n" "$check_name" "$WARNING" "$data"
	done
}

GREP="git grep -n --color"

run_check() {
	local check_name="$1"
	shift
	$GREP "$@" | comment_filter | myprint "$check_name"
}

# $GREP "<<print .<<" -- 'game/*.twee' | myprint "<<print>>ingBullshit"
# Check, e.g.  <<<
run_check 'TripleOpen' "<<<[^\\\"']" -- 'game/*.twee'
# Check, e.g.  >>>
run_check 'TripleClose' "[^\\\"']>>>" -- 'game/*.twee'
# Check, e.g.  <<print "abc" $d, some false positives in complex constructs because git-grep cannot do most (? constructs
# Note: " *" is on purpose, "\s*" doesn't work here in git-grep
    # $GREP -E "^[^']*<<(print|set)[^'\\\">]+('[^']*')([^'>]+'[^']*')* *[_'\\\$]" -- 'game/*' | myprint 'RunInConcat'
    # $GREP -E '^[^"]*<<(print|set)[^\\"'"'"'>]+("[^"]*")([^">]+"[^"]*")* *[_"\\\$]' -- 'game/*' | myprint 'RunInConcat2'
    # $GREP -E "^[^']*<<(print|set)[^'\\\">]+('[^']*')([^'>]+'[^']*')*[^'>]*([a-np-ru-zA-Z)]|[^t]o|[^i]s|[^o]t) *'" -- 'game/*' | myprint 'RunInConcat3'
    # $GREP -E '^[^"]*<<(print|set)[^\\"'"'"'>]+("[^"]*")([^">]+"[^"]*")*[^">]*([a-np-ru-zA-Z)]|[^t]o|[^i]s|[^o]t) *"' -- 'game/*' | myprint 'RunInConcat4'
#commented this out because it just seems like a total nightmare to try to understand
run_check 'RunInConcat' '-E' "<<print ['\`\"][^'\`\"<]+['\`\"][^+]+['\`\"][^'\`\"]['\`\"]"

# Check for missing right angle bracket: <</if>
run_check 'MissingClosingAngleBracket' "<</[^>]*>[^>]" -- 'game/*'
run_check 'MissingClosingAngleBracket2' "<<[^>()]*>[^()<>"$'\r]*\r'"\?$" -- 'game/*'
# Check for missing left angle bracket: </if>>
run_check 'MissingOpeningAngleBracket2' "\([^<]\|^\)</\?\(if\|else\|case\|set\|print\|elseif\)" -- 'game/*'
# Check for accidental assignment.  e.g.:   <<if $foo = "hello">>
run_check 'AccidentalAssignmentInIf' "<<[ ]*if[^>=]*[^><\!=]=[^=>][^>]*>>" -- 'game/*'
# Check for accidental assignment.  e.g.:   <<elseif $foo = "hello">>
run_check 'AccidentalAssignmentInElseIf' "<<[ ]*elseif[^>=]*[^><\!=]=[^=>]*>>" -- 'game/*'
# Check for missing ".  e.g.:   <<if $foo == "hello>>
# $GREP -e "<<[^\"<>]*\"[^\"<>]*>>" -- 'game/*' | myprint 'MissingSpeechMark'
# Check for missing ".  e.g.:   <<if $foo = "hello)
# $GREP -e "<<[^\"<>]*\([^\"<>]*\"[^><\"]*\"\| [<>] \)*\"\([^\"<>]*\"[^><\"]*\"\| [<>] \)*\([^\"<>]\| [<>] \)*>>" --and --not -e "*[^']*" -- 'game/*' | myprint 'MissingSpeechMark2'
# Check for colours like: @@color:red   - should be @@.red
run_check 'UseCssColors' '-e' "@@color:" --and --not -e "@@color:rgb([0-9 ]\+,[0-9 ]\+,[0-9 ]\+)" -- 'game/*'
# Check for missing $ in activeSlave or PC
run_check 'MissingDollar' "<<[ ]*[^\$><_\[]*\(activeSlave\|PC\)[.]" -- 'game/*'
# Check for closing bracket without opening bracket.  e.g.:  <<if foo)>>	  (but  <<case "foo")>>   is valid, so ignore those
run_check 'MissingOpeningBracket' '-e' "<<[ a-zA-Z]\+\([^()<>]\|[^()<>][<>][^()<>]\)*)" --and --not -F -e "<< *case" -- 'game/*.twee'
# Check for opening bracket without closing bracket.  e.g.:  <<if (foo>>
run_check 'MissingClosingBracket' '-e' "<<[ a-zA-Z]\([^<>]\|[^<>][<>][^<>]\)\+(\([^()<>]\|[^<>()][<>][^<>()]\|([^<>()]*])\)*>>" --and --not -F -e ':(' -- 'game/*.twee'
# Check for two closing brackets but one opening bracket.  e.g.:  <<if (foo))>>
run_check 'MissingOpeningBracket2' '-e' "<<[ a-zA-Z]\+[^()<>]*([^()]*)[^()]*)[^()<>]*>>" --and --not -F -e ':(' -- 'game/*'
# Check for one closing bracket but two opening brackets.  e.g.:  <<if ((foo)>>
run_check 'MissingClosingBracket2' '-P' "<<[ a-zA-Z]+\(\((?:[^()]|(?R))*\)(?!.*\))" -- 'game/*'
#run_check 'MissingClosingBracket3' '-e' "<<.*[(][^<>)]*[(][^<>)]*)\?[^<>)]*>>" -- 'game/*'
# Check for missing >>.  e.g.:   <<if $foo
# doesn't play well with multiple lines, should be moved to check.py
#$GREP "<<[^<>]*[^,\"\[{"$'\r]\r'"\?$" -- 'game/*' | myprint 'MissingClosingAngleBrackets'
#$GREP "<<[^<>]*[^,\"\[{]\?$" -- 'game/*' | myprint 'MissingClosingAngleBrackets'
# Check for too many >>>.  e.g.: <</if>>>
run_check 'TooManyAngleBrackets' "<<[^<>\"]*[<>]\?[^<>\"]*>>>" -- 'game/*.twee'
# Check for too many <<<.  e.g.: <<</if>>
run_check 'TooManyAngleBrackets2' "<<<[^<>\"]*[<>]\?[^<>\"]*>>" -- 'game/*.twee'
# Check for wrong capitalisation on 'activeslave' and other common typos
run_check 'SpellCheck' "\(csae\|[a-z] She \|attepmts\|youreslf\|advnaces\|acheive\|gendre\|apperance\|pronounCaps\|carress\|varient\)" -- 'game/*'
run_check 'PregmodderCannotSpellReceive' '-F' 'reciev' -- 'game/*'
#run_check 'ShouldBeSlaves' '-F' '$slave[' -- 'game/*'
# Check for strange spaces e.g.  $slaves[$i]. lips
#run_check 'MissingPropertyAfterSlaves' "\$slaves\[\$i\]\. " -- 'game/*'
# Check, e.g., <<//if>>
run_check 'DoubleSlash' "<</[a-zA-Z]*[^a-zA-Z<>]\+[a-zA-Z]*>>" -- 'game/*'
# Check, e.g.  <<else $foo==4
run_check 'ShouldBeElseIf' "<<else >\?[^>]" -- 'game/*'
# Check, e.g.  <</else
run_check 'ElseForAnIf' '-F' '<</else' -- 'game/*'
# Check, e.g., =to
run_check 'EqualAndTo' '-F' '=to' -- 'game/*'
# Check, e.g.  <<set foo == 4>>
run_check 'DoubleEqualsInSet' '-P' "<<set (?![^>]*\bto\b)[^{>=]*==" -- 'game/*'
# Check for, e.g   <<if slaves[foo]>>
#run_check 'MissingDollar' "<<\([^>]\|[^>]>[^>]\)*[^$]slaves\[" -- 'game/*'
# Check for missing $ or _ in variable name:
run_check 'MissingDollar2' '-e' "<<[a-zA-Z]\([^>\"]\|[^>]>[^>]\|\"[^\"]*\"\)* [a-zA-Z]\+ * =(?!>)" -- 'game/*'
# Check for missing command, e.g.  <<foo =
run_check 'BadCommand' '-e' "<<[a-zA-Z]* = *" -- 'game/*'
# Check for duplicate words, e.g. with with
run_check 'DuplicateWords' '-e' " \(\b[a-zA-Z][a-zA-Z]\+\) \1\b " --and --not -F -e " her her " --and --not -e " you you " --and --not -e " New New " --and --not -e "true true" --and --not -e "false false" --and --not -e "null null" --and --not -e "No No" --and --not -e "no no" --and --not -e "Slave Slave " --and --not -e "Kitchen Kitchen" --and --not -e "Drink Drink" --and --not -e " that that " --and --not -e " in in " --and --not -e " is is " -- 'game/*'
# Check for obsolete SugarCube macros
run_check 'ObsoleteMacro' '-E' "<<display |<<click|<<.*\.contains" -- 'game/*'
# Check for double articles
run_check 'DoubleArticle' '-E' "\Wa an\W" -- 'game/*'
# Check for incorrect articles
$GREP -i -E "\Wa (a|e|i|o|u)." -- 'game/*' | grep -a -i -vE "\Wa (eu|in|on|un|us|ut|ur|ui)." | grep -a -i -vE "(&|<)." | comment_filter | myprint 'IncorrectArticle'
$GREP -i -E "\Wan (b|c|d|f|g|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z)\w." -- 'game/*' | grep -a -vE "\W[aA]n ([A-Z]{3,4}|npc)" | comment_filter | myprint 'IncorrectArticle2'
# Check for $ sign mid-word
run_check 'VarSignMidWord' '-i' "\w$\w" -- 'game/*.twee'
# check for $ sign at beginning of macro
run_check 'VarSignAtMacroStart' '<<\s*\$[^{]' -- 'game/*'
# check for missing ; before statement
run_check 'MissingSemicolonBeforeStatement' 'if $ ' -- 'game/*'
run_check 'MissingSemicolonBeforeStatement' 'elseif $ ' -- 'game/*'
run_check 'MissingSpaceInMacro' '^::[^ ]' -- 'game/*.twee'
run_check 'MissingColonInMacro' '^: ' -- 'game/*'
run_check 'MismatchedPassTimes' '-P' '[(]0:0(.)[)].*<pass (?!\1)' -- 'game/*'
run_check 'MismatchedPassTimes2' '-P' '[(]0:([^0].)[)].*<pass (?!\1)' -- 'game/*'
# check for the typeof operator NOT being compared to a string; if you write `typeof undefined is undefined`, you'll get false. the return value is a STRING.
run_check 'TypeofNotComparedToString' '-E' "typeof \S+ (===?|is|eq) [^\"']" -- 'game/*'
# Look for variables like $foo.bar  where it occurs only once.
# There's a lot of false-positives, but it also catches a lot of
# mistakes, so use grep to filter out the false-positives.
# Feel free to add to the list to filter out false-positives as they occur
git grep -h -o '[$][a-zA-Z0-9_-]\+[.][a-zA-Z0-9_]\+[^a-zA-Z0-9_(]' -- 'game' | sed -e 's/.$//' | grep -v '[.]\(replace\|deleteAt\|push\|delete\|length\|indexOf\)' | grep -v '[$]\(attitudesControl\|debug\|carried\|dateCount\|newVersionData\|skul_dock\|store\|wardrobe\|shopClothingFilter\|replayScene\|per_npc\|featsBoosts\|_item\|map\|swarm\|NPCList\|avery_\|chimera\|_chimeraOptions\|_clothingStrings\|defileSacredGroundStore\|_demon\|estatePersistent\|frozenValues\|_furnishing\|furnitureDowngrade\|hcChallenge\|kylarDaily\|_menstruation\|_value\|virginTaken\|_worn\)' | sort | uniq -u | xargs -I '{}' $GREP -w '{}' -- 'game/*' | comment_filter | myprint 'VariableUsedOnlyOnce'
# Check that we do not have any variables that we use only once.   e.g.	 $onlyUsedOnce
# Ignore  *Nationalities
(
cd game/
find . -name '*.twee' -not -path './special-templates/*' -exec cat '{}' ';' | tr -c '$a-zA-Z' '\n' | sed -n '/^[$]/p' | sort | uniq -u | sed 's/^[$]/-e[$]/' | sed 's/$/\\\\W/' | xargs -r git grep -n --color | comment_filter | myprint 'OnlyUsedOnce'

#Find all the variables listed in init.twee
VARIABLELIST=$(cat base-*/init.twee | tr -c '$a-zA-Z' '\n' | sed -n '/^[$]/p' | sort | uniq)
# Find all variables anywhere.  Commented out because the output is too noisy currently
#VARIABLELIST=$(find . -name "*.twee" -exec cat '{}' ';' | tr -c '$a-zA-Z' '\n'  | sed -n '/^[$]/p' | sort | uniq)
MISSINGFROMVERSIONUPDATE=$(for variable in $VARIABLELIST; do grep -q "$variable" 04-Variables/variables-versionUpdate.twee || echo "$variable"; done)
echo -e "game/04-Variables/variables-versionUpdate.twee$ENDC: $(echo $MISSINGFROMVERSIONUPDATE)" | myprint 'MissingFromVersionUpdate'
)

git ls-files 'game/*.twee' | xargs -d '\n' ./devTools/check.py

read -p 'Press [Enter] key to continue...'
