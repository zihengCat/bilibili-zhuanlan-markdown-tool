#!/bin/bash
# ---------------------------
# Simple Bash-Script for
# detecting images file type.
# ---------------------------
# Author: zihengCat
# ---------------------------
# Requirements: bash
#               xxd
# ---------------------------
# Platform: UNIX
#           Linux
#           macOS
# ---------------------------
if [[ ${#} != 1 ]]
then
    echo "[ERROR]: Command line parameter does not fit"
else
    # ===================================
    # Read first 3 bytes or first 4 bytes
    # ===================================
    # JPEG -> FFD8FF
    # PNG  -> 89504E47
    # GIF  -> 47494638
    # ================
    bytes_3=$(xxd -p -l 3 ${1})
    bytes_4=$(xxd -p -l 4 ${1})
    if [[ ${bytes_3} == "ffd8ff" ]]
    then
        echo "[INFO] Image File \`${1}\` Type -> \`jpg\`"
    elif [[ ${bytes_4} == "89504e47" ]]
    then
        echo "[INFO] Image File \`${1}\` Type -> \`png\`"
    elif [[ ${bytes_4} == "47494638" ]]
    then
        echo "[INFO] Image File \`${1}\` Type -> \`gif\`"
    else
        echo "[INFO] File \`${1}\` Type => \`unknown\`"
    fi
fi
