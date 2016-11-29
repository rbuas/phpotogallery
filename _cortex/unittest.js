TEST = function($, tracer) {
    UnitTest = {
        VERBOSE : true,
        OUTPUT_CONTAINER : null,

        SetVerboseMode : function (active) {
            this.VERBOSE = active;
        },

        SetOutputContainer : function ( containerId ) {
            if(containerId == null)
                return ERROR(false, "Missing the function parameter : containerId");

            var container = jQuery( containerId );
            if(container == null)
                return ERROR(false, "Can not find the containerId : " + containerId);

            this.OUTPUT_CONTAINER = container;
            return true;
        },

        CreateCase : function(caseName, func) {
            if(caseName == null)
                return ERROR(false, "Missing the function parameter : caseName");
            if(func == null)
                return ERROR(false, "Missing the function parameter : func");
            if(typeof(func) != 'function')
                return ERROR(false, "The second parameter 'func' must be a function");

            var caseName = caseName;
            var func = func;
            var self = this;
            return function(testid, input) {
                var testid = testid || "";
                var caseLabel = caseName + "::" + testid;

                //self.Message( "<span class='case'>Run test : " + caseLabel + "</span>");
                var ret = func.apply(this, arguments);
                if( ret == false ) {
                    self.Message( "<span class='error'>TEST FAILED : " + caseLabel + "</span>");
                } else {
                    self.Message( "<span class='ok'>TEST OK : " + caseLabel + "</span>");
                }
            };
        },

        StartSession : function(title) {
            this.Message("<h3 class='sessiontitle'>TEST SESSION : " + title + "</h3>");
        },

        Message : function ( msg ) {
            if( this.VERBOSE && this.OUTPUT_CONTAINER ) {
                this.OUTPUT_CONTAINER.append( "<p>" + msg + "</p>" );
            }
        }
    }

    return UnitTest;
}(jQuery, tracer);

function ERROR ( error, msg ) {
    console.log( "%cERROR : %s", "color: #ff1515;", msg );
    return error;
}

//TEST UNIT FUNCITONS
function ASSERT_DIFF (value, expected, msg) {
    if (!ASSERT(value != expected, msg)) {
        console.log("          value is not different to expected");
        console.log("      value : ", value);
        console.log("   expected : ", expected);
        return false;
    }
    return true;
}

function ASSERT_EQ (value, expected, msg) {
    if (!ASSERT(value == expected, msg)) {
        console.log("          value is the same as expected");
        console.log("      value : ", value);
        console.log("   expected : ", expected);
        return false;
    }
    return true;
}

function ASSERT_OBJ (a, b, msg) {
    if( a === b )
        return true;

    if(!ASSERT(a != null && b != null, msg))
        return false;

    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    if(!ASSERT(aProps.length == bProps.length, msg)) {
        console.log("          objects are not similar");
        console.log("          a : ", a);
        console.log("          b : ", b);
        return false;
    }

    var ret = true;
    for(var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        if(!ASSERT( a[propName] === b[propName], msg )) {
            ret = false;
            break;
        }
    }
    if(ret == false) {
        console.log("          objects are not similar");
        console.log("          a : ", a);
        console.log("          b : ", b);
    }

    return ret;
}

function ASSERT (condition, msg) {
    if (!condition) {
        console.log("%cTEST FAILED : %s", "color: #a31515;", msg);
        return false;
    } else {
        console.log("%cTEST     OK : %s", "color: #008000;", msg);
        return true;
    }
}