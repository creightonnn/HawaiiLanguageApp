#!/usr/bin/perl
use strict;
use warnings;

local $/;
open(my $fh, "<", $ARGV[0]) or die "Cannot open $ARGV[0]: $!";
my $sql = <$fh>;
close($fh);

# Escape for JSON string
$sql =~ s/\\/\\\\/g;
$sql =~ s/"/\\"/g;
$sql =~ s/\n/\\n/g;
$sql =~ s/\r/\\r/g;
$sql =~ s/\t/\\t/g;

print "{\"query\":\"$sql\"}\n";
