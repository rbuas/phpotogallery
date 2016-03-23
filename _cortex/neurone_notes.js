(function ($, tracer, cortex) {
    cortex.controller(
        'NeuroneNotes', 
        ['$scope', '$rootScope', '$sce', '$timeout', function NeuroneNotes ($scope, $rootScope, $sce, $timeout) {
        var notes = this;
        notes.editing = false;

        notes.edit = function() {
            notes.editing = true;
        }

        notes.discardChanges = function() {
            notes.notecontent = notes.note && notes.note.content || "";
            notes.editing = false;
        }

        notes.showEditPanel = function() {
            return notes.note != null && notes.master && notes.editing;
        }

        notes.saveChanges = function() {
            if(!notes.note)
                return;

            cortex.noteSave(notes.note.id, notes.notecontent);
        }


        /////////////
        // PRIVATE
        ///////

        function update () {
            notes.route = cortex.get(Cortex.DATA.ROUTE); 
            notes.slug = cortex.get(Cortex.DATA.SLUG);

            notes.notelist = null;
            cortex.noteList();

            updateParams();
            updateUser();
        }

        function updateParams () {
            notes.params = cortex.get(Cortex.DATA.PARAMS);
            notes.noteid = notes.params ? notes.params.noteid : null;
            notes.note = null;
            if(notes.noteid) {
                cortex.noteGet(notes.noteid);
            }
        }

        function updateUser () {
            var user = cortex.get(Cortex.DATA.USER);

            notes.master = user && user.email
                           && notes.route && notes.route.MASTER 
                           && notes.route.MASTER.indexOf(user.email) >= 0;
        }

        $scope.$on(Cortex.DATA.NOTE, function() {
            if(notes.noteid)
                notes.note = cortex.get(Cortex.DATA.NOTE);

            notes.discardChanges();
            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.NOTELIST, function() { 
            notes.notelist = cortex.get(Cortex.DATA.NOTELIST);
            notes.discardChanges();
            $scope.$apply();
        });

        $scope.$on(Cortex.DATA.USER, function() {  updateUser(); $scope.$apply(); });
        $scope.$on(Cortex.DATA.ROUTE, function() {  update(); $scope.$apply(); });
        $scope.$on(Cortex.DATA.PARAMS, function() { updateParams(); });

        update();
    }]);
})(jQuery, tracer, cortex);