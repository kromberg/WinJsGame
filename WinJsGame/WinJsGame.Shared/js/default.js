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
var answers_numbers = [];
var answers_map = {};

var GameState = {
    Initial:       0,
    Loading:       1,
    Running:       2,
    NextQeuestion: 3,
    Paused:        4,
    Suspended:     5,
    Lost:          6,
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
                // TODO: register onclick
                document.getElementById("phone-body").addEventListener("click", onGlobalClick, true);
                // TODO: prepare new question
                question = getNextQuestion();

                break;
            case GameState.Paused:
                // TODO: show menu
                break;
            case GameState.Suspended:
                // TODO
                break;
            case GameState.Lost:
                // show 'Lost' image
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

    return _question;
}

function viewQuestion(question) {
    // generate random asnwer numbers
    var numbers = [0, 1, 2, 3];
    answers_numbers = [];
    var idx;
    while (numbers.length != 0) {
        idx = Math.floor(1000 * Math.random()) % numbers.length;
        answers_numbers.push(numbers[idx]);
        numbers.splice(idx, 1);
    }

    // set answers map
    answers_map =
    {
        "answer-btn1": answers_numbers[0],
        "answer-btn2": answers_numbers[1],
        "answer-btn3": answers_numbers[2],
        "answer-btn4": answers_numbers[3],
    };

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
        question = getNextQuestion();
        if (null === question) {
            // show error message
            return;
        }

        // change state to 'Running'
        game.changeState(GameState.Running);
    });
}

function onAnswerBtnClick(eventInfo) {
    if (GameState.Running != game.gameState) {
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
            document.getElementById("menu-btn").addEventListener("click", function (eventInfo) {
                // TODO
            },
            false);

            // set menu button position
            $("#menu-btn").css("width", $("#menu-btn").outerHeight().toString() + "px");
            $("#menu-btn").css("margin-left", (($("#answers-div").width() - $("#menu-btn").width()) / 2).toString() + "px");

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