/*jslint browser: true*/

var marker = (function () {
    "use strict";

    var exports, tagsToMark, classToAppend;

    /**
     * Viewable Highlighter module
     * @module marker
     */
    exports = {};

    tagsToMark = [];

    classToAppend = "";

    /**
     * Function to see if a given element is in view of the user
     * @memberof module:marker
     * @param {HTMLElement} el The element to check in view
     * @returns {Boolean} Whether the given element is in view
     */
    function isInView(el) {
        // Get the bounds of the element
        var rect = el.getBoundingClientRect();

        // Return whether it is within view of the client
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }

    /**
     * Function to mark an element with class that denotes being in view
     * @memberof module:marker
     * @param {HTMLElement} el Element to mark in view
     */
    function markInView(el) {
        // See if the element is in view
        if (isInView(el)) {
            // If it is, mark it as such
            el.className = classToAppend;
        } else {
            // Otherwise remove its class
            el.removeAttribute("class");
        }
    }

    /**
     * Array reduce functor that gets the elements of type provided to the reduce
     * @memberof module:marker
     * @param {(HTMLElement[] | String)} previousVal Nodes that have already been found or the type of the node to search for
     * @param {String} [currVal] Type of the nodes to find
     * @returns {HTMLElement[]} All elements of provided node type as well as the ones already found
     */
    function getElements(previousVal, currVal) {
        /*
         * This function is really only to be used with a reduce call.
         * The idea is that the initial value will be the result of
         * a call to getElements which will kick off the search for 
         * the elements of the needed types.
         * 
         * This function that concatenates the initial result with the
         * result of the search for the next node type searched for.
         */
        var els, elsArr;

        // See if we were given a current value
        currVal = (currVal || previousVal);
        // Get all the elements of the current needed type
        els = document.getElementsByTagName(currVal);
        // Convert from HTMLCollection to Array
        elsArr = Array.prototype.slice.call(els);
        // Concat if we had previous nodes
        if (previousVal && (previousVal instanceof Array)) {
            elsArr = elsArr.concat(previousVal);
        }
        // Return the found nodes
        return elsArr;
    }

    /**
     * Function to mark all elements of the necessary types
     * @memberof module:marker
     */
    function markAllInView() {
        var initialReduceVal, iterables;
        // Make sure we have tags to mark
        if (tagsToMark.length > 0) {
            // Get the initial array of elements we need to find with the first tag
            initialReduceVal = getElements(tagsToMark[0]);
            // Get the remaining elements with the unfound tag types
            iterables = tagsToMark.reduce(getElements, initialReduceVal);
            // Mark all the found elements
            iterables.forEach(markInView);
        }
    }

    /**
     * Function to attach the window listeners which cause marking refresh
     * @memberof module:marker
     */
    function load() {
        // We refresh on scroll
        document.addEventListener("scroll", markAllInView);
        // We refresh on resize
        window.addEventListener("resize", markAllInView);
        // Do the initial marking
        markAllInView();
    }

    /**
     * Function to startup the marking
     * @param {Object} [kwArgs] The parameters to initialize with
     * @param {String[]} [kwArgs.tagsToMark] The array of tag types to mark
     * @param {String} [kwArgs.classToAppend] The class to append to an element when it is in view
     */
    function init(kwArgs) {
        kwArgs = (kwArgs || {});
        tagsToMark = (kwArgs.tagsToMark || []);
        classToAppend = (kwArgs.classToAppend || "");
        load();
    }

    // Export stuff
    exports.init = init;

    // Return our module
    return exports;
}());