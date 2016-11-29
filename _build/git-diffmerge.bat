git config --global diff.tool diffmerge
git config --global difftool.diffmerge.cmd "C:/Program\ Files/SourceGear/Common/DiffMerge/sgdm.exe \"$LOCAL\" \"$REMOTE\""
git config --global difftool.diffmerge.trustExitCode true
git config --global difftool.prompt false
git config --global alias.dt difftool 
git config --global merge.tool diffmerge
git config --global mergetool.diffmerge.trustExitCode true
git config --global mergetool.diffmerge.cmd "C:/Program\ Files/SourceGear/Common/DiffMerge/sgdm.exe /merge /result=\"$MERGED\" \"$LOCAL\" \"$BASE\" \"$REMOTE\""
git config --global mergetool.prompt false
git config --global alias.mt mergetool 