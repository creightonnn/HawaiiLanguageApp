#!/usr/bin/perl
use strict;
use warnings;

my ($slug, $verify_jwt, $file) = @ARGV;

local $/;
open(my $fh, "<", $file) or die "Cannot open $file: $!";
my $body = <$fh>;
close($fh);

# Escape for JSON string
$body =~ s/\\/\\\\/g;
$body =~ s/"/\\"/g;
$body =~ s/\n/\\n/g;
$body =~ s/\r/\\r/g;
$body =~ s/\t/\\t/g;

my $vj = ($verify_jwt eq 'true') ? 'true' : 'false';

print "{\"slug\":\"$slug\",\"name\":\"$slug\",\"verify_jwt\":$vj,\"body\":\"$body\"}\n";
