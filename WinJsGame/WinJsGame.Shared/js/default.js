// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286

var bundles = [];
var questions = [];
var question = {};
//var question =
//    {
//        black_white_img_url: "../images/heath-ledger-bw.png",
//        full_color_img_url: "../images/heath-ledger-colored.png",
//        answers:
//        {
//            en: [
//                "Heath Ledger",
//                "Thomas Ostermeier",
//                "Brandon Stark",
//                "Daniel Radcliffe"
//            ],
//            ru: [
//                "Хит Леджер",
//                "Томас Остермайер",
//                "Брандон Старк",
//                "Дэниел Рэдклифф"
//            ]
//        },
//        correct_answer: 0 // counting from 0
//    };

// answers numbers and mapping
var answers_map = {};

var GameState = {
    Initial: 0,
    Loading: 1,
    Running: 2,
    Playing: 3,
    NextQeuestion: 4,
    Paused: 5,
    Suspended: 6,
    Lost: 7,
};

function onGlobalClick(eventInfo) {
    game.changeState(GameState.Running);
}

var game = {
    gameState: GameState.Initial,
    prevGameState: GameState.Initial,
    changeState: function (state) {
        this.prevGameState = this.gameState;
        this.gameState = state;
        this.onStateChanged();
    },
    onStateChanged: function () {
        switch (this.gameState) {
            case GameState.Initial:
                // TODO
                break;
            case GameState.Loading:
                // load bundle
                loadBundle("ms-appx:///images/bundle.json");
                break;
            case GameState.Running:
                showMenu(true);
                break;
            case GameState.Playing:
                // show next question
                document.getElementById("phone-body").removeEventListener("click", onGlobalClick, true);
                if (null === question) {
                    // show error message
                    return;
                }
                viewQuestion(question);
                break;
            case GameState.NextQeuestion:
                // show image
                WinJS.UI.executeTransition(
                    document.getElementById("color-image-div"),
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 500,
                        timing: "linear",
                        from: 0,
                        to: 1
                    });
                // register onclick
                document.getElementById("phone-body").addEventListener("click", onGlobalClick, true);
                // prepare new question
                result = getNextQuestion();
                if (null === result) {
                    // TODO: log error? exit
                    return;
                }
                question = result.question;
                answers_map = result.answers_map;

                break;
            case GameState.Paused:
                // show menu
                showMenu(false);
                function onBackBtnPressed(eventInfo) {
                    // Notifies OS that you've handled the back button event.
                    eventInfo.handled = true;

                    // hide menu and set previous game state
                    hideMenu();
                    game.changeState(game.prevGameState);
                    // remove event listener from back button
                    Windows.Phone.UI.Input.HardwareButtons.removeEventListener("backpressed", onBackBtnPressed);
                }
                Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", onBackBtnPressed);
                break;
            case GameState.Suspended:
                // TODO
                break;
            case GameState.Lost:
                // show 'Lost' image
                $("#lost-div").css("display", "block");
                WinJS.UI.executeTransition(
                    document.getElementById("lost-div"),
                    {
                        property: "opacity",
                        delay: 0,
                        duration: 500,
                        timing: "linear",
                        from: 0,
                        to: 1
                    });
                break;
            default:
                break;
        }
    }
};

function getNextQuestion() {
    // get random question and remove it from questions
    if (0 == questions.length)
        return null;
    var _question_id = Math.floor(Math.random() * questions.length);
    var _question = questions[_question_id];
    questions.splice(_question_id, 1);

    // generate random asnwer numbers
    var _numbers = [0, 1, 2, 3];
    var _answers_numbers = [];
    var _idx;
    while (_numbers.length != 0) {
        _idx = Math.floor(1000 * Math.random()) % _numbers.length;
        _answers_numbers.push(_numbers[_idx]);
        _numbers.splice(_idx, 1);
    }

    // set answers map
    var _answers_map =
    {
        "answer-btn1": _answers_numbers[0],
        "answer-btn2": _answers_numbers[1],
        "answer-btn3": _answers_numbers[2],
        "answer-btn4": _answers_numbers[3],
    };

    return { question: _question, answers_map: _answers_map };
}

function viewQuestion(question) {
    // set images opacity
    $("#color-image-div").css("opacity", 0);
    $("#black-white-image-div").css("opacity", 0);

    // insert images
    $("#color-image").attr("src", question.full_color_img_url);
    $("#black-white-image").attr("src", question.black_white_img_url);

    // TODO: get region
    for (var i = 1; i <= 4; ++i) {
        $("#answer-btn" + i.toString()).html(question.answers.en[answers_map["answer-btn" + i.toString()]]);
    }

    // set images position
    $("#black-white-image").css("margin-top", (($("#black-white-image-div").height() - $("#black-white-image").height()) / 2).toString() + "px");
    $("#color-image").css("margin-top", (($("#color-image-div").height() - $("#color-image").height()) / 2).toString() + "px");

    // annimate image
    WinJS.UI.executeTransition(
        document.getElementById("black-white-image-div"),
        {
            property: "opacity",
            delay: 0,
            duration: 500,
            timing: "linear",
            from: 0,
            to: 1
        });
}

function loadBundle(pathToBundle) {
    WinJS.xhr({
        url: pathToBundle
    }).then(function (response) {
        var bundle = JSON.parse(response.responseText);
        bundles.push(bundle);

        // TMP
        questions = bundles[0].questions;

        // get first question
        result = getNextQuestion();
        if (null === result) {
            // show error message
            return;
        }
        question = result.question;
        answers_map = result.answers_map;

        // change state to 'Running'
        game.changeState(GameState.Running);
    });
}

function hideMenu() {
    // annimate menu
    WinJS.UI.executeTransition(
        document.getElementById("menu-div"),
        {
            property: "opacity",
            delay: 0,
            duration: 500,
            timing: "linear",
            from: 1,
            to: 0
        }).done(
        function () {
            $("#menu-div").css("width", "0px");
            $("#menu-div").css("height", "0px");
            $("#menu-div").css("display", "none");
        });
    // annimate overlay
    //WinJS.UI.executeTransition(
    //    document.getElementById("overlay-div"),
    //    {
    //        property: "opacity",
    //        delay: 0,
    //        duration: 500,
    //        timing: "linear",
    //        from: 0.5,
    //        to: 0
    //    }).done(
    //    function () {
    //        $("#overlay-div").css("width", "0px");
    //        $("#overlay-div").css("height", "0px");
    //        $("#overlay-div").css("display", "none");
    //    });
}

function showMenu(initial) {
    // TODO: generate menu
    var menuHtmlUri;
    if (initial) {
        menuHtmlUri = "ms-appx:///html/initial_menu.html";
    }
    else {
        menuHtmlUri = "ms-appx:///html/menu.html";
    }
    WinJS.xhr({
        url: menuHtmlUri
    }).then(function (response) {
        WinJS.Utilities.setInnerHTML(document.getElementById("menu-div"), response.responseText);

        //$("#overlay-div").css("width", "100%");
        //$("#overlay-div").css("height", "100%");
        //$("#overlay-div").css("display", "block");

        $("#menu-div").css("width", "100%");
        $("#menu-div").css("height", "100%");
        $("#menu-div").css("display", "block");

        // fill menu
        //var menu_div_height = 0;
        //$("#menu-div").children().each(function () {
        //    menu_div_height += $(this).outerHeight();
        //});
        //$("#menu-div").css("height", menu_div_height.toString() + "px");

        if (!initial) {
            // annimate overlay
            //WinJS.UI.executeTransition(
            //    document.getElementById("overlay-div"),
            //    {
            //        property: "opacity",
            //        delay: 0,
            //        duration: 500,
            //        timing: "linear",
            //        from: 1,
            //        to: 0.5
            //    });
            // annimate menu
            WinJS.UI.executeTransition(
                document.getElementById("menu-div"),
                {
                    property: "opacity",
                    delay: 0,
                    duration: 500,
                    timing: "linear",
                    from: 0,
                    to: 1
                });
        }

        // register menu buttons events
        if (initial) {
            $("#new-game-btn").css("height", $("#new-game-btn").outerWidth().toString() + "px");
            document.getElementById("new-game-btn").addEventListener("click", function (eventInfo) {
                hideMenu();
                game.changeState(GameState.Playing);
            },
            false);
        }
        else {
            $("#restart-game-btn").css("height", $("#restart-game-btn").outerWidth().toString() + "px");
            document.getElementById("restart-game-btn").addEventListener("click", function (eventInfo) {
                // TODO
            },
            false);
        }
        $("#bundles-btn").css("height", $("#bundles-btn").outerWidth().toString() + "px");
        document.getElementById("bundles-btn").addEventListener("click", function (eventInfo) {
            // TODO
        },
        false);
        $("#shop-btn").css("height", $("#shop-btn").outerWidth().toString() + "px");
        document.getElementById("shop-btn").addEventListener("click", function (eventInfo) {
            // TODO
        },
        false);

        $.each($(".menu-btn"), function () {
            $(this).css("padding-top", ($(this).height() - 5 - parseFloat($(this).css("font-size"))).toString() + "px");
            $(this).css("margin", (($("#menu-div").outerWidth()/2 - $(this).outerWidth()) / 2).toString() + "px");
        });
    });
}

function onAnswerBtnClick(eventInfo) {
    if (GameState.Playing != game.gameState) {
        // TODO: some error log
        return;
    }

    // get answer button id
    var answer_id = answers_map[eventInfo.target.id];

    if (question.correct_answer == answer_id) {
        // correct answer
        game.changeState(GameState.NextQeuestion);
    }
    else {
        // incorrect answer, show fail
        game.changeState(GameState.Lost);
    }
}

function onActivated(args) {
    var activation = Windows.ApplicationModel.Activation;

    if (args.detail.kind === activation.ActivationKind.launch) {
        if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
            // TODO: This application has been newly launched. Initialize
            // your application here.
        } else {
            // TODO: This application has been reactivated from suspension.
            // Restore application state here.
        }
        args.setPromise(WinJS.UI.processAll().then(function completed() {
            game.changeState(GameState.Initial);

            // set button click listeners
            $.each($(".answer-btn"), function () {
                this.addEventListener("click", onAnswerBtnClick, false);
            });

            // set button event listener
            document.getElementById("menu-center-btn").addEventListener("click", function (eventInfo) {
                game.changeState(GameState.Paused);
            },
            false);

            // set menu button position
            $("#menu-center-btn").css("height", Math.floor(0.8 * $("#answers-div").outerHeight()).toString() + "px");
            $("#menu-center-btn").css("width", $("#menu-center-btn").outerHeight().toString() + "px");
            $("#menu-center-btn").css("margin-top", (($("#answers-div").outerHeight() - $("#menu-center-btn").outerHeight()) / 2).toString() + "px");
            $("#menu-center-btn").css("margin-left", (($("#answers-div").outerWidth() - $("#menu-center-btn").outerWidth()) / 2).toString() + "px");

            // set state to 'Loading'
            game.changeState(GameState.Loading);
        }));
    }
}

function onCheckpoint(args) {
    // TODO: This application is about to be suspended. Save any state
    // that needs to persist across suspensions here. You might use the
    // WinJS.Application.sessionState object, which is automatically
    // saved and restored across suspension. If you need to complete an
    // asynchronous operation before your application is suspended, call
    // args.setPromise().


    game.changeState(GameState.Suspended);
}

(function () {
    "use strict";

    var app = WinJS.Application;
    app.onactivated = onActivated;
    app.oncheckpoint = onCheckpoint;


    app.start();
})();