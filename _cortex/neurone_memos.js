(function ($, tracer, cortex, browserext) {
    cortex.controller('NeuroneMemos', ['$scope', '$rootScope', '$sce', '$timeout', function NeuroneMemos ($scope, $rootScope, $sce, $timeout) {
        var memos = this;
        memos.editing = false;

        memos.changeText = function(memotext) {
            cortex.broadcast("memotext", memotext);
        }

        memos.discardChanges = function() {
            memos.changeText(memos.memo && memos.memo.text || "");
            memos.editing = false;
        }

        memos.edit = function() {
            memos.editing = true;
        }

        memos.remove = function() {
            cortex.memoRemove(memos.memoid);
        }

        memos.saveChanges = function() {
            cortex.memoSave(memos.memoid, memos.memotext);
            memos.editing = false;
        }

        memos.showMemo = function() {
            return memos.memo != null;
        }

        memos.showEditPanel = function() {
            return memos.user && memos.showMemo() && memos.memo.origin == memos.user.uid;
        }

        memos.hasChanges = function() {
            if(!memos.memo)
                return;

            return memos.memotext != memos.memo.text;
        }



        /////////////
        // PRIVATE
        ///////

        function isUserHome () {
            return memos.user && memos.user.uid && memos.params && memos.params.memouser == memos.user.uid;
        }

        function update (forcerequest) {
            memos.route = cortex.get(Cortex.DATA.ROUTE); 
            memos.slug = cortex.get(Cortex.DATA.SLUG);
            memos.user = cortex.userCurrent();

            if(forcerequest)
                updateParams(forcerequest);
            else
                updateMemo();
        }

        function updateParams (forcerequest) {
            memos.params = cortex.get(Cortex.DATA.PARAMS);
            if(forcerequest) requestMemo(memos.params && (memos.params.memoid || memos.params.memouser));
        }

        function requestMemo (memoid) {
            if(!memoid)
                return;

            if(memos.memoid == memoid)
                return;

            memos.memo = null;
            if(memoid) cortex.memoGet(memoid);
        }

        function updateMemo () {
            memos.memo = cortex.get(Cortex.DATA.MEMO);
            tracer.message("update memo : ", memos.memo);

            memos.memoid = memos.memo && memos.memo.mid || null;
            memos.memotext = memos.memo && memos.memo.text || "";
            parseMemo();

            updateBreadcrumb();
            updateList();
        }

        function parseMemo () {
            memos.memotemp = cortex.memoParse(memos.memotext);
            memos.memoparsed = memos.memotemp && memos.memotemp.text || "";
        }

        function updateBreadcrumb () {
            if(!memos.memo || !memos.memo.mid)
                return;

            var breadcrumb = memos.memo.mid.split("/");
            memos.memo.breadcrumb = [];

            var acc = "";
            for(var i in breadcrumb) {
                if(!breadcrumb.hasOwnProperty(i))
                    continue;

                var slice = breadcrumb[i];
                if(!slice)
                    continue;

                acc = acc + "/" + slice;
                memos.memo.breadcrumb.push({label:slice, link:acc});
            }
        }

        function updateList () {
            memos.childlist = [];

            if(!memos.memo || !memos.memo.mid || !memos.memo.child)
                return;

            for(var k in memos.memo.child) {
                if(!memos.memo.child.hasOwnProperty(k))
                    continue;

                var child = memos.memo.child[k];
                if(!child)
                    continue;

                var item = typeof(child) == 'string' ? child : k;
                if(memos.childlist.indexOf(item) >= 0)
                    continue;

                memos.childlist.push(item);
            }
            memos.childlist.sort();
        }

        $scope.$on("memotext", function(event, memotext) {
            memos.memotext = memotext;
            parseMemo();
        })

        $scope.$on(Cortex.DATA.MEMO, function() {
            updateMemo();

            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.USER, function() {
            update(true);

            $scope.$apply(); 
        });

        $scope.$on(Cortex.DATA.ROUTE, function() {  
            update();

            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.SLUG, function() {  
            update();

            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.PARAMS, function() { 
            updateParams(true);
        });

        update();
    }]);
})(jQuery, tracer, cortex, browserext);