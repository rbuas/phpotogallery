git config --global diff.tool diffmerge
git config --global difftool.diffmerge.cmd "/Applications/DiffMerge.app/Contents/Resources/diffmerge.sh \"\$LOCAL\" \"\$REMOTE\""
git config --global difftool.diffmerge.trustExitCode true
git config --global difftool.prompt false
git config --global alias.dt difftool 
git config --global merge.tool diffmerge
git config --global mergetool.diffmerge.trustExitCode true
git config --global mergetool.diffmerge.cmd "/Applications/DiffMerge.app/Contents/Resources/diffmerge.sh --merge --result=\"\$MERGED\" \"\$LOCAL\" \"\$BASE\" \"\$REMOTE\""
git config --global mergetool.prompt false
git config --global alias.mt mergetool 
