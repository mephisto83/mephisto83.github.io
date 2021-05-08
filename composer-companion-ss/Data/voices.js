﻿var master_voice_list = [{ "name": "@3", "voice": ["00", "07", "12"] }, { "name": "@4", "voice": ["00", "07", "12", "19"] }, { "name": "+ /11", "voice": ["00", "04", "08", "15"] }, { "name": "+ /4", "voice": ["00", "04", "05", "08"] }, { "name": "+", "voice": ["00", "04", "08"] }, { "name": "° /11", "voice": ["00", "03", "06", "15"] }, { "name": "° /2/-13", "voice": ["00", "02", "03", "06", "18"] }, { "name": "° /2/-6", "voice": ["00", "02", "03", "06", "08"] }, { "name": "° /4", "voice": ["00", "03", "05", "06"] }, { "name": "° /9/-13", "voice": ["00", "03", "06", "12", "18"] }, { "name": "° /9/-6", "voice": ["00", "03", "06", "08", "12"] }, { "name": "°", "voice": ["00", "03", "06"] }, { "name": "° 6", "voice": ["00", "03", "06", "09"] }, { "name": "° 6S", "voice": ["00", "05", "06", "09"] }, { "name": "° 7/11", "voice": ["00", "03", "06", "09", "15"] }, { "name": "° 7/-13", "voice": ["00", "03", "06", "09", "18"] }, { "name": "° 7/2", "voice": ["00", "02", "03", "06", "09"] }, { "name": "° 7/4", "voice": ["00", "03", "05", "06", "09"] }, { "name": "° 7/-6", "voice": ["00", "03", "06", "08", "09"] }, { "name": "° 7/9", "voice": ["00", "03", "06", "09", "12"] }, { "name": "° 7", "voice": ["00", "03", "06", "09"] }, { "name": "° 7S", "voice": ["00", "05", "06", "09"] }, { "name": "° M7", "voice": ["00", "03", "06", "0B"] }, { "name": "° S", "voice": ["00", "05", "06"] }, { "name": "11", "voice": ["00", "04", "07", "0A", "12", "15"] }, { "name": "11 +5 c", "voice": ["00", "02", "04", "05", "08", "0A"] }, { "name": "11 +5", "voice": ["00", "04", "08", "0A", "12", "15"] }, { "name": "11 +5+9 c", "voice": ["00", "03", "04", "05", "08", "0A"] }, { "name": "11 +5+9", "voice": ["00", "04", "08", "0A", "13", "15"] }, { "name": "11 +9 c", "voice": ["00", "03", "04", "05", "07", "0A"] }, { "name": "11 +9", "voice": ["00", "04", "07", "0A", "13", "15"] }, { "name": "11 -13 c", "voice": ["00", "02", "04", "05", "07", "08", "0A"] }, { "name": "11 -13", "voice": ["00", "04", "07", "0A", "12", "15", "18"] }, { "name": "11 -5 c", "voice": ["00", "02", "04", "05", "06", "0A"] }, { "name": "11 -5", "voice": ["00", "04", "06", "0A", "12", "15"] }, { "name": "11 -5-9 c", "voice": ["00", "01", "04", "05", "06", "0A"] }, { "name": "11 -5-9", "voice": ["00", "04", "06", "0A", "11", "15"] }, { "name": "11 -9 c", "voice": ["00", "01", "04", "05", "07", "0A"] }, { "name": "11 -9", "voice": ["00", "04", "07", "0A", "11", "15"] }, { "name": "11 -9+9 c", "voice": ["00", "01", "03", "04", "05", "07", "0A"] }, { "name": "11 -9+9", "voice": ["00", "04", "07", "0A", "11", "13", "15"] }, { "name": "11 c", "voice": ["00", "02", "04", "05", "07", "0A"] }, { "name": "13", "voice": ["00", "04", "07", "0A", "12", "15", "19"] }, { "name": "13 +11 c", "voice": ["00", "02", "04", "06", "07", "09", "0A"] }, { "name": "13 +11", "voice": ["00", "04", "07", "0A", "12", "16", "19"] }, { "name": "13 +9 c", "voice": ["00", "03", "04", "05", "07", "09", "0A"] }, { "name": "13 +9", "voice": ["00", "04", "07", "0A", "13", "15", "19"] }, { "name": "13 +9+11 c", "voice": ["00", "03", "04", "06", "07", "09", "0A"] }, { "name": "13 +9+11", "voice": ["00", "04", "07", "0A", "13", "16", "19"] }, { "name": "13 -5-9 c", "voice": ["00", "01", "04", "05", "06", "09", "0A"] }, { "name": "13 -5-9", "voice": ["00", "04", "06", "0A", "11", "15", "19"] }, { "name": "13 -9 c", "voice": ["00", "01", "04", "05", "07", "09", "0A"] }, { "name": "13 -9", "voice": ["00", "04", "07", "0A", "11", "15", "19"] }, { "name": "13 -9+11 c", "voice": ["00", "01", "04", "06", "07", "09", "0A"] }, { "name": "13 -9+11", "voice": ["00", "04", "07", "0A", "11", "16", "19"] }, { "name": "13 -9+9+11 c", "voice": ["00", "01", "03", "04", "06", "07", "09", "0A"] }, { "name": "13 -9+9+11", "voice": ["00", "04", "07", "0A", "11", "13", "16", "19"] }, { "name": "13 c", "voice": ["00", "02", "04", "05", "07", "09", "0A"] }, { "name": "5", "voice": ["00", "07"] }, { "name": "5", "voice": ["00", "17"] }, { "name": "6 S2", "voice": ["00", "02", "07", "09"] }, { "name": "7 /+2/+4/-6", "voice": ["00", "03", "04", "06", "07", "08", "0A"] }, { "name": "7 /+2/+4", "voice": ["00", "03", "04", "06", "07", "0A"] }, { "name": "7 /+2/-6", "voice": ["00", "03", "04", "05", "07", "08", "0A"] }, { "name": "7 /11", "voice": ["00", "04", "07", "0A", "15"] }, { "name": "7 /13", "voice": ["00", "00", "40", "70", "A1", "9undefined"] }, { "name": "7 /-2/+2/+4/-6", "voice": ["00", "01", "03", "04", "06", "07", "08", "0A"] }, { "name": "7 /-2/+2", "voice": ["00", "01", "03", "04", "07", "0A"] }, { "name": "7 /-2/+4/-6", "voice": ["00", "01", "04", "06", "07", "08", "0A"] }, { "name": "7 /-2/+4", "voice": ["00", "01", "04", "06", "07", "0A"] }, { "name": "7 /-2/-6", "voice": ["00", "01", "04", "07", "08", "0A"] }, { "name": "7 /-2", "voice": ["00", "01", "04", "07", "0A"] }, { "name": "7 /4", "voice": ["00", "04", "05", "07", "0A"] }, { "name": "7 /6", "voice": ["00", "04", "07", "09", "0A"] }, { "name": "7", "voice": ["00", "04", "07", "0A"] }, { "name": "7 +5/+2", "voice": ["00", "03", "04", "08", "0A"] }, { "name": "7 +5/-2/+2", "voice": ["00", "01", "03", "04", "08", "0A"] }, { "name": "7 +5/-2/+2/+4", "voice": ["00", "01", "03", "04", "06", "08", "0A"] }, { "name": "7 +5/-2", "voice": ["00", "01", "04", "08", "0A"] }, { "name": "7 +5", "voice": ["00", "04", "08", "0A"] }, { "name": "7 +5+9", "voice": ["00", "04", "08", "0A", "13"] }, { "name": "7 +5-9", "voice": ["00", "04", "08", "0A", "11"] }, { "name": "7 +5-9+9", "voice": ["00", "04", "08", "0A", "11", "13"] }, { "name": "7 +5-9+9+11", "voice": ["00", "04", "08", "0A", "11", "13", "16"] }, { "name": "7 +9 c", "voice": ["00", "03", "04", "07", "0A"] }, { "name": "7 +9", "voice": ["00", "04", "07", "0A", "13"] }, { "name": "7 +9+11", "voice": ["00", "04", "07", "0A", "13", "16"] }, { "name": "7 +9+11-13", "voice": ["00", "04", "07", "0A", "13", "16", "18"] }, { "name": "7 +9-13", "voice": ["00", "04", "07", "0A", "13", "18"] }, { "name": "7 -5/+2", "voice": ["00", "03", "04", "06", "0A"] }, { "name": "7 -5/-2/+2", "voice": ["00", "01", "03", "04", "06", "0A"] }, { "name": "7 -5/-2", "voice": ["00", "01", "04", "06", "0A"] }, { "name": "7 -5", "voice": ["00", "04", "06", "0A"] }, { "name": "7 -5+9", "voice": ["00", "04", "06", "0A", "13"] }, { "name": "7 -5-9", "voice": ["00", "04", "06", "0A", "11"] }, { "name": "7 -5-9+9", "voice": ["00", "04", "06", "0A", "11", "13"] }, { "name": "7 -9 sus4 c", "voice": ["00", "01", "05", "07", "0A"] }, { "name": "7 -9 sus4", "voice": ["00", "05", "07", "0A", "11"] }, { "name": "7 -9", "voice": ["00", "04", "07", "0A", "11"] }, { "name": "7 -9+11", "voice": ["00", "04", "07", "0A", "11", "16"] }, { "name": "7 -9+11-13", "voice": ["00", "04", "07", "0A", "11", "16", "18"] }, { "name": "7 -9+9", "voice": ["00", "04", "07", "0A", "11", "13"] }, { "name": "7 -9+9+11-13", "voice": ["00", "04", "07", "0A", "11", "13", "16", "18"] }, { "name": "7 -9-13", "voice": ["00", "04", "07", "0A", "11", "18"] }, { "name": "7 S2", "voice": ["00", "02", "07", "0A"] }, { "name": "7 sus4", "voice": ["00", "05", "07", "0A"] }, { "name": "9 /+4", "voice": ["00", "04", "06", "07", "0A", "12"] }, { "name": "9 /+4c", "voice": ["00", "02", "04", "06", "07", "0A"] }, { "name": "9", "voice": ["00", "04", "07", "0A", "12"] }, { "name": "9 +11", "voice": ["00", "04", "07", "0A", "12", "16"] }, { "name": "9 +5 c", "voice": ["00", "02", "04", "08", "0A"] }, { "name": "9 +5/+4 c", "voice": ["00", "02", "04", "06", "08", "0A"] }, { "name": "9 +5/+4", "voice": ["00", "04", "06", "08", "0A", "12"] }, { "name": "9 +5", "voice": ["00", "04", "08", "0A", "12"] }, { "name": "9 +5+11", "voice": ["00", "04", "08", "0A", "12", "16"] }, { "name": "9 -5 c", "voice": ["00", "02", "04", "06", "0A"] }, { "name": "9 -5", "voice": ["00", "04", "06", "0A", "12"] }, { "name": "9 c", "voice": ["00", "02", "04", "07", "0A"] }, { "name": "9 sus4 c", "voice": ["00", "02", "05", "07", "0A"] }, { "name": "9 sus4/13", "voice": ["00", "05", "07", "0A", "12", "19"] }, { "name": "9 sus4/6 c", "voice": ["00", "02", "05", "07", "09", "0A"] }, { "name": "9 sus4/6", "voice": ["00", "05", "07", "09", "0A", "12"] }, { "name": "9 sus4", "voice": ["00", "05", "07", "0A", "12"] }, { "name": "aug", "voice": ["00", "04", "08"] }, { "name": "iA1", "voice": ["00", "01"] }, { "name": "iA1", "voice": ["00", "11"] }, { "name": "iA2", "voice": ["00", "03"] }, { "name": "iA2", "voice": ["00", "13"] }, { "name": "iA3", "voice": ["00", "05"] }, { "name": "iA3", "voice": ["00", "15"] }, { "name": "iA4", "voice": ["00", "06"] }, { "name": "iA4", "voice": ["00", "16"] }, { "name": "iA5", "voice": ["00", "08"] }, { "name": "iA5", "voice": ["00", "18"] }, { "name": "iA6", "voice": ["00", "0A"] }, { "name": "iA6", "voice": ["00", "1A"] }, { "name": "iA7", "voice": ["00", "00"] }, { "name": "iA7", "voice": ["00", "10"] }, { "name": "id1", "voice": ["00", "0B"] }, { "name": "id1", "voice": ["00", "1B"] }, { "name": "id2", "voice": ["00", "00"] }, { "name": "id2", "voice": ["00", "10"] }, { "name": "id3", "voice": ["00", "02"] }, { "name": "id3", "voice": ["00", "12"] }, { "name": "id4", "voice": ["00", "04"] }, { "name": "id4", "voice": ["00", "14"] }, { "name": "id5", "voice": ["00", "06"] }, { "name": "id5", "voice": ["00", "16"] }, { "name": "id6", "voice": ["00", "07"] }, { "name": "id6", "voice": ["00", "17"] }, { "name": "id7", "voice": ["00", "09"] }, { "name": "id7", "voice": ["00", "19"] }, { "name": "im2", "voice": ["00", "01"] }, { "name": "iM2", "voice": ["00", "02"] }, { "name": "im2", "voice": ["00", "11"] }, { "name": "iM2", "voice": ["00", "12"] }, { "name": "im3", "voice": ["00", "03"] }, { "name": "iM3", "voice": ["00", "04"] }, { "name": "im3", "voice": ["00", "13"] }, { "name": "iM3", "voice": ["00", "14"] }, { "name": "im6", "voice": ["00", "08"] }, { "name": "iM6", "voice": ["00", "09"] }, { "name": "im6", "voice": ["00", "18"] }, { "name": "iM6", "voice": ["00", "19"] }, { "name": "im7", "voice": ["00", "0A"] }, { "name": "iM7", "voice": ["00", "0B"] }, { "name": "im7", "voice": ["00", "1A"] }, { "name": "iM7", "voice": ["00", "1B"] }, { "name": "iP4", "voice": ["00", "05"] }, { "name": "iP4", "voice": ["00", "15"] }, { "name": "iP5", "voice": ["00", "07"] }, { "name": "iP5", "voice": ["00", "17"] }, { "name": "iU1", "voice": ["00", "00"] }, { "name": "iU1", "voice": ["00", "10"] }, { "name": "Ma /+13", "voice": ["00", "04", "07", "1A"] }, { "name": "Ma /+6", "voice": ["00", "04", "07", "0A"] }, { "name": "Ma /11", "voice": ["00", "04", "07", "15"] }, { "name": "Ma /-13", "voice": ["00", "04", "07", "18"] }, { "name": "Ma /2/11", "voice": ["00", "02", "04", "07", "15"] }, { "name": "Ma /2/4", "voice": ["00", "02", "04", "05", "07"] }, { "name": "Ma /2", "voice": ["00", "02", "04", "07"] }, { "name": "Ma /4", "voice": ["00", "04", "05", "07"] }, { "name": "Ma /-6", "voice": ["00", "04", "07", "08"] }, { "name": "Ma /9/11", "voice": ["00", "04", "07", "12", "15"] }, { "name": "Ma /9/4", "voice": ["00", "04", "05", "07", "12"] }, { "name": "Ma /9/4", "voice": ["00", "04", "07", "12"] }, { "name": "Ma /9", "voice": ["00", "04", "07", "12"] }, { "name": "Ma", "voice": ["00", "04", "07"] }, { "name": "Ma +6+4", "voice": ["00", "04", "06", "07", "0A"] }, { "name": "Ma 11 c", "voice": ["00", "02", "04", "05", "07", "0A"] }, { "name": "Ma 11", "voice": ["00", "04", "07", "0B", "12", "15"] }, { "name": "Ma 11 pc", "voice": ["00", "02", "04", "05", "07", "0B"] }, { "name": "Ma 11+5 c", "voice": ["00", "02", "04", "05", "08", "0B"] }, { "name": "Ma 11+5", "voice": ["00", "04", "08", "0B", "12", "15"] }, { "name": "Ma 11+5+9 c", "voice": ["00", "03", "04", "05", "08", "0B"] }, { "name": "Ma 11+5+9", "voice": ["00", "04", "08", "0B", "13", "15"] }, { "name": "Ma 11+5-9 c", "voice": ["00", "01", "04", "05", "08", "0B"] }, { "name": "Ma 11+5-9", "voice": ["00", "04", "08", "0B", "11", "15"] }, { "name": "Ma 11+9 c", "voice": ["00", "03", "04", "05", "07", "0A"] }, { "name": "Ma 11+9 pc", "voice": ["00", "03", "04", "05", "07", "0B"] }, { "name": "Ma 11+9", "voice": ["00", "04", "07", "0B", "13", "15"] }, { "name": "Ma 11-5 c", "voice": ["00", "02", "04", "05", "06", "0B"] }, { "name": "Ma 11-5", "voice": ["00", "04", "06", "0B", "12", "15"] }, { "name": "Ma 11-5-9 c", "voice": ["00", "01", "04", "05", "06", "0B"] }, { "name": "Ma 11-5-9/-6", "voice": ["00", "04", "06", "08", "0B", "11", "15"] }, { "name": "Ma 11-5-9", "voice": ["00", "04", "06", "0B", "11", "15"] }, { "name": "Ma 11-5-9-13 c", "voice": ["00", "01", "04", "05", "06", "08", "0B"] }, { "name": "Ma 11-5-9-13", "voice": ["00", "04", "06", "0B", "11", "15", "18"] }, { "name": "Ma 11-9 c", "voice": ["00", "01", "04", "05", "07", "0A"] }, { "name": "Ma 11-9 pc", "voice": ["00", "01", "04", "05", "07", "0B"] }, { "name": "Ma 11-9", "voice": ["00", "04", "07", "0B", "11", "15"] }, { "name": "Ma 13 c", "voice": ["00", "02", "04", "05", "07", "09", "0B"] }, { "name": "Ma 13", "voice": ["00", "04", "07", "0B", "12", "15", "19"] }, { "name": "Ma 13 pc", "voice": ["00", "02", "04", "05", "07", "09", "0B"] }, { "name": "Ma 13+11 c", "voice": ["00", "02", "04", "06", "07", "09", "0B"] }, { "name": "Ma 13+11", "voice": ["00", "04", "07", "0B", "12", "16", "19"] }, { "name": "Ma 13+11 pc", "voice": ["00", "02", "04", "06", "07", "09", "0A"] }, { "name": "Ma 13+5 c", "voice": ["00", "02", "03", "05", "08", "09", "0B"] }, { "name": "Ma 13+5", "voice": ["00", "03", "08", "0B", "12", "15", "19"] }, { "name": "Ma 13-5 c", "voice": ["00", "02", "04", "05", "06", "09", "0B"] }, { "name": "Ma 13-5", "voice": ["00", "04", "06", "0B", "12", "15", "19"] }, { "name": "Ma 5/11", "voice": ["00", "07", "15"] }, { "name": "Ma 5/9", "voice": ["00", "07", "12"] }, { "name": "Ma -5", "voice": ["00", "04", "06"] }, { "name": "Ma 5", "voice": ["00", "07"] }, { "name": "Ma 5", "voice": ["00", "17"] }, { "name": "Ma 6 sus4", "voice": ["00", "05", "07", "09"] }, { "name": "Ma 6/11", "voice": ["00", "04", "07", "09", "15"] }, { "name": "Ma 6/2", "voice": ["00", "02", "04", "07", "09"] }, { "name": "Ma 6/4", "voice": ["00", "04", "05", "07", "09"] }, { "name": "Ma 6/9", "voice": ["00", "04", "07", "09", "12"] }, { "name": "Ma 6/9 sus4", "voice": ["00", "05", "07", "09", "12"] }, { "name": "Ma 6/9 sus4 c", "voice": ["00", "02", "05", "07", "09"] }, { "name": "Ma 6/9-5 c", "voice": ["00", "02", "04", "06", "09"] }, { "name": "Ma 6/9-5", "voice": ["00", "04", "06", "09", "12"] }, { "name": "Ma 6", "voice": ["00", "04", "07", "09"] }, { "name": "Ma 6-5", "voice": ["00", "04", "06", "09"] }, { "name": "Ma 7 -5/-2", "voice": ["00", "01", "04", "06", "0B"] }, { "name": "Ma 7/+11", "voice": ["00", "04", "07", "0B", "16"] }, { "name": "Ma 7/+2", "voice": ["00", "03", "04", "07", "0B"] }, { "name": "Ma 7/+4", "voice": ["00", "04", "06", "07", "0B"] }, { "name": "Ma 7/11", "voice": ["00", "04", "07", "0B", "15"] }, { "name": "Ma 7/13", "voice": ["00", "04", "07", "0B", "19"] }, { "name": "Ma 7/4", "voice": ["00", "04", "05", "07", "0B"] }, { "name": "Ma 7/6", "voice": ["00", "04", "07", "09", "0B"] }, { "name": "Ma 7", "voice": ["00", "04", "07", "0B"] }, { "name": "Ma 7+5/+2", "voice": ["00", "03", "04", "08", "0B"] }, { "name": "Ma 7+5/-2", "voice": ["00", "01", "04", "08", "0B"] }, { "name": "Ma 7+5", "voice": ["00", "04", "08", "0B"] }, { "name": "Ma 7+5+9", "voice": ["00", "04", "08", "0B", "13"] }, { "name": "Ma 7+5-9", "voice": ["00", "04", "08", "0B", "11"] }, { "name": "Ma 7+9", "voice": ["00", "04", "07", "0B", "13"] }, { "name": "Ma 7-5/+2", "voice": ["00", "03", "04", "06", "0B"] }, { "name": "Ma 7-5", "voice": ["00", "04", "06", "0B"] }, { "name": "Ma 7-5+5", "voice": ["00", "04", "06", "08", "0B"] }, { "name": "Ma 7-5+9", "voice": ["00", "04", "06", "0B", "13"] }, { "name": "Ma 7-5-9", "voice": ["00", "04", "06", "0B", "11"] }, { "name": "Ma 7-9 c", "voice": ["00", "01", "04", "07", "0A"] }, { "name": "Ma 7-9", "voice": ["00", "04", "07", "0B", "11"] }, { "name": "Ma 7-9 pc", "voice": ["00", "01", "04", "07", "0B"] }, { "name": "Ma 7sus4", "voice": ["00", "05", "07", "0B"] }, { "name": "Ma 9 /+4", "voice": ["00", "04", "06", "07", "0B", "12"] }, { "name": "Ma 9 c", "voice": ["00", "02", "04", "07", "0A"] }, { "name": "Ma 9/-6", "voice": ["00", "04", "07", "08", "0B", "12"] }, { "name": "Ma 9 pc", voice: ["00", "02", "04", "07", "0B"] }, { "name": "Ma 9", "voice": ["00", "04", "07", "0B", "12"] }, { "name": "Ma 9+11 c", "voice": ["00", "02", "04", "06", "07", "0A"] }, { "name": "Ma 9+11 pc", "voice": ["00", "02", "04", "06", "07", "0B"] }, { "name": "Ma 9+11", "voice": ["00", "04", "07", "0B", "12", "16"] }, { "name": "Ma 9+5 c", "voice": ["00", "02", "04", "08", "0B"] }, { "name": "Ma 9+5/+4 c", "voice": ["00", "02", "04", "06", "08", "0B"] }, { "name": "Ma 9+5/+4", "voice": ["00", "04", "06", "08", "0B", "12"] }, { "name": "Ma 9+5", "voice": ["00", "04", "08", "0B", "12"] }, { "name": "Ma 9+5+11", "voice": ["00", "04", "08", "0B", "12", "16"] }, { "name": "Ma 9-13 c", "voice": ["00", "02", "04", "07", "08", "0A"] }, { "name": "Ma 9-13 pc", "voice": ["00", "02", "04", "07", "08", "0B"] }, { "name": "Ma 9-13", "voice": ["00", "04", "07", "0B", "12", "18"] }, { "name": "Ma 9-5 c", "voice": ["00", "02", "04", "06", "0B"] }, { "name": "Ma 9-5", "voice": ["00", "04", "06", "0B", "12"] }, { "name": "Ma 9-5+5 c", "voice": ["00", "02", "04", "06", "08", "0B"] }, { "name": "Ma 9-5+5", "voice": ["00", "04", "06", "08", "0B", "12"] }, { "name": "Ma 9sus4 c", "voice": ["00", "02", "05", "07", "0B"] }, { "name": "Ma 9sus4", "voice": ["00", "05", "07", "0B", "12"] }, { "name": "Ma sus4/9", "voice": ["00", "05", "07", "12"] }, { "name": "Ma sus4", "voice": ["00", "05", "07"] }, { "name": "mi /11", "voice": ["00", "03", "07", "15"] }, { "name": "mi /2", "voice": ["00", "02", "03", "07"] }, { "name": "mi /4", "voice": ["00", "03", "05", "07"] }, { "name": "mi /9", "voice": ["00", "03", "07", "12"] }, { "name": "mi", "voice": ["00", "03", "07"] }, { "name": "mi 11 c", "voice": ["00", "02", "03", "05", "07", "0A"] }, { "name": "mi 11/-6", "voice": ["00", "03", "07", "08", "0A", "12", "15"] }, { "name": "mi 11/6", "voice": ["00", "03", "07", "09", "0A", "12", "15"] }, { "name": "mi 11", "voice": ["00", "03", "07", "0A", "12", "15"] }, { "name": "mi 11+5 c", "voice": ["00", "02", "03", "05", "08", "0A"] }, { "name": "mi 11+5", "voice": ["00", "03", "08", "0A", "12", "15"] }, { "name": "mi 11-13 c", "voice": ["00", "02", "03", "05", "07", "08", "0A"] }, { "name": "mi 11-13", "voice": ["00", "03", "07", "0A", "12", "15", "18"] }, { "name": "mi 11-5 c", "voice": ["00", "02", "03", "05", "06", "0A"] }, { "name": "mi 11-5", "voice": ["00", "03", "06", "0A", "12", "15"] }, { "name": "mi 11-5+5 c", "voice": ["00", "02", "03", "05", "06", "08", "0A"] }, { "name": "mi 11-5+5", "voice": ["00", "03", "06", "08", "0A", "12", "15"] }, { "name": "mi 11-5-13 c", "voice": ["00", "02", "03", "05", "06", "08", "0A"] }, { "name": "mi 11-5-13", "voice": ["00", "03", "06", "0A", "12", "15", "18"] }, { "name": "mi 11-5-9-13 c", "voice": ["00", "01", "03", "05", "06", "08", "0A"] }, { "name": "mi 11-5-9-13", "voice": ["00", "03", "06", "0A", "11", "15", "18"] }, { "name": "mi 11-9", "voice": ["00", "03", "07", "0A", "11", "15"] }, { "name": "mi 13 c", "voice": ["00", "02", "03", "05", "07", "09", "0A"] }, { "name": "mi 13", "voice": ["00", "03", "07", "0A", "12", "15", "19"] }, { "name": "mi 13+5+11 c", "voice": ["00", "02", "03", "06", "08", "09", "0A"] }, { "name": "mi 13+5+11", "voice": ["00", "03", "08", "0A", "12", "16", "19"] }, { "name": "mi 13-5 c", "voice": ["00", "02", "03", "05", "06", "09", "0A"] }, { "name": "mi 13-5", "voice": ["00", "03", "06", "0A", "12", "15", "19"] }, { "name": "mi 13-9 c", "voice": ["00", "01", "03", "05", "07", "09", "0A"] }, { "name": "mi 13-9", "voice": ["00", "03", "07", "0A", "11", "15", "19"] }, { "name": "mi -5", "voice": ["00", "03", "06"] }, { "name": "mi 6/11", "voice": ["00", "03", "07", "09", "15"] }, { "name": "mi 6/2", "voice": ["00", "02", "03", "07", "09"] }, { "name": "mi 6/4", "voice": ["00", "03", "05", "07", "09"] }, { "name": "mi 6/9", "voice": ["00", "03", "07", "09", "12"] }, { "name": "mi 6", "voice": ["00", "03", "07", "09"] }, { "name": "mi 6-5", "voice": ["00", "03", "06", "09"] }, { "name": "mi 7/11/-2", "voice": ["00", "01", "03", "07", "0A", "15"] }, { "name": "mi 7/11", "voice": ["00", "03", "07", "0A", "15"] }, { "name": "mi 7/13", "voice": ["00", "03", "07", "0A", "19"] }, { "name": "mi 7/2", "voice": ["00", "02", "03", "07", "0A"] }, { "name": "mi 7/4/-2", "voice": ["00", "01", "03", "05", "07", "0A"] }, { "name": "mi 7/4/-9", "voice": ["00", "03", "05", "07", "0A", "11"] }, { "name": "mi 7/4", "voice": ["00", "03", "05", "07", "0A"] }, { "name": "mi 7/6", "voice": ["00", "03", "07", "09", "0A"] }, { "name": "mi 7", "voice": ["00", "03", "07", "0A"] }, { "name": "mi 7+5", "voice": ["00", "03", "08", "0A"] }, { "name": "mi 7-5/-13 c", "voice": ["00", "03", "06", "08", "0A"] }, { "name": "mi 7-5/-13", "voice": ["00", "03", "06", "0A", "18"] }, { "name": "mi 7-5", "voice": ["00", "03", "06", "0A"] }, { "name": "mi 7-9 c", "voice": ["00", "01", "03", "07", "0A"] }, { "name": "mi 7-9", "voice": ["00", "03", "07", "0A", "11"] }, { "name": "mi 9/4", "voice": ["00", "03", "05", "07", "0A", "12"] }, { "name": "mi 9", "voice": ["00", "03", "07", "0A", "12"] }, { "name": "mi 9+5 c", "voice": ["00", "02", "03", "08", "0A"] }, { "name": "mi 9+5", "voice": ["00", "03", "08", "0A", "12"] }, { "name": "mi 9-5 c", "voice": ["00", "02", "03", "06", "0A"] }, { "name": "mi 9-5/-13 c", "voice": ["00", "02", "03", "06", "08", "0A"] }, { "name": "mi 9-5/-13", "voice": ["00", "03", "06", "0A", "12", "18"] }, { "name": "mi 9-5", "voice": ["00", "03", "06", "0A", "12"] }, { "name": "mi 9-5+5 c", "voice": ["00", "02", "03", "06", "08", "0A"] }, { "name": "mi 9-5+5", "voice": ["00", "03", "06", "08", "0A", "12"] }, { "name": "mi M11 c", "voice": ["00", "02", "03", "05", "07", "0B"] }, { "name": "mi M11", "voice": ["00", "03", "07", "0B", "12", "15"] }, { "name": "mi M11-5-9 c", "voice": ["00", "01", "03", "05", "06", "0B"] }, { "name": "mi M11-5-9", "voice": ["00", "03", "06", "0B", "11", "15"] }, { "name": "mi M13 c", "voice": ["00", "02", "03", "05", "07", "09", "0B"] }, { "name": "mi M13", "voice": ["00", "03", "07", "0B", "12", "15", "19"] }, { "name": "mi M7", "voice": ["00", "03", "07", "0B"] }, { "name": "mi M7-5-9 c", "voice": ["00", "01", "03", "06", "0B"] }, { "name": "mi M7-5-9", "voice": ["00", "03", "06", "0B", "11"] }, { "name": "mi M9 c", "voice": ["00", "02", "03", "07", "0B"] }, { "name": "mi M9", "voice": ["00", "03", "07", "0B", "12"] }, { "name": "mystic", "voice": ["00", "04", "06", "09", "0A", "12"] }, { "name": "mysticC", "voice": ["00", "02", "04", "06", "09", "0A"] }, { "name": "ø 7", "voice": ["00", "03", "06", "0A"] }, { "name": "Q 3", "voice": ["00", "05", "0A"] }, { "name": "Q 4 c", "voice": ["00", "03", "05", "0A"] }, { "name": "Q 4", "voice": ["00", "05", "0A", "03"] }, { "name": "Q 4", "voice": ["00", "05", "0A", "13"] }, { "name": "Q 5 c", "voice": ["00", "03", "05", "08", "0A"] }, { "name": "Q 5", "voice": ["00", "05", "0A", "13", "18"] }, { "name": "Q 5", "voice": ["00", "05", "0A", "13", "18"] }, { "name": "s 2", "voice": ["00", "02", "07"] }, { "name": "s M7-5", "voice": ["00", "02", "05", "06", "0B"] }, { "name": "sus2/sus4", "voice": ["00", "02", "05", "07"] }];