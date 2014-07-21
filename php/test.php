<?php
/*
 * Write two functions that both group integers by thousands. The first
 * function should use native PHP functions to do the job. The second
 * should NOT use native number formatting functions, i.e. roll your
 * own.
 *
 * Written by Faber Fedor (faberfedor@gmail.com) 20140717
 *
 */

$locales = ['en_US.UTF-8', 'de_DE.UTF-8', 'fr_FR.UTF-8' ];

foreach( $locales as $locale) {
    setlocale('LC_ALL', $locale);
    echo '<strong>locale is set to ' . setlocale('LC_ALL', "0") ."</strong><br>\n";
    echo "<br>\n";
    echo "the PHP way: " . formatIntsThePHPWay(123456789) . "<br>\n";
    echo "A better way: " .  formatIntsTheRightWay(123456789) . "<br>\n<br>\n";
    echo "the PHP way: " . formatIntsThePHPWay(12345) . "<br>\n";
    echo "A better way: " .  formatIntsTheRightWay(12345) . "<br>\n<br>\n";
    echo "the PHP way: " . formatIntsThePHPWay(-123456789) . "<br>\n";
    echo "A better way: " .  formatIntsTheRightWay(-123456789) . "<br>\n<br>\n";
    echo "the PHP way: " . formatIntsThePHPWay(-12345) . "<br>\n";
    echo "A better way: " .  formatIntsTheRightWay(-12345) . "<br>\n<br>\n";
}


function formatIntsThePHPWay($integer) {
    return number_format($integer);
}

/* almost same results as above, but handles i18n and doesn't use PHP
 * formatting functions.
 */
function formatIntsTheRightWay($integer) {
    $groupedNumber = "";
    $localeEnv = localeconv();
    $thousands_sep = $localeEnv["mon_thousands_sep"];
    $isNegative =  $integer < 0 ? true : false ;
    $strInteger = strval(abs($integer));

    for ( $i = 1 ; $i <= strlen($strInteger)  ; $i++) {
   
        if ($i%3 == 0) {
            $groupedNumber = $groupedNumber . substr($strInteger, 0 - $i, 1) .  $thousands_sep ;
        } else {
            $groupedNumber = $groupedNumber . substr($strInteger, 0 - $i, 1);

        }
    }
   
    $groupedNumber  = strrev(rtrim($groupedNumber, $thousands_sep));
 
    return $isNegative  ? '-' . $groupedNumber :  $groupedNumber;
}


?>
