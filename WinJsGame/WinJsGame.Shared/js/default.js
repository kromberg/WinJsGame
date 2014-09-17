// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286

var questions = [];
// TODO: select from loaded questions
var question =
    {
        black_white_img_url: "../images/heath-ledger-bw.png",
        full_color_img_url: "../images/heath-ledger-colored.png",
        answers: [
            "Heath Ledge",
            "Thomas Oukledge",
            "Bran Stark",
            "Deniel Redcliff"
        ],
        correct_answer: 0 // counting from 0
    };

// TODO: random
var answers_map = {};

var GameState = {
    Initial: 0,
    Running: 1,
    NextQeuestion: 2,
    Paused: 3,
    Suspended: 4,
    Lost: 5,
};

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
            case GameState.Running:
                // TODO: show new question
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
                // TODO: prepare new question
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

function viewQuestion(question) {
    // TODO: generate answers map
    answers_map =
    {
        "answer-btn1": 3,
        "answer-btn2": 0,
        "answer-btn3": 1,
        "answer-btn4": 2,
    };

    // insert images
    $("#color-image").attr("src", question.full_color_img_url);
    $("#black-white-image").attr("src", question.black_white_img_url);

    for (var i = 1; i <= 4; ++i) {
        $("#answer-btn" + i.toString()).html(question.answers[answers_map["answer-btn" + i.toString()]]);
    }

    // set images position
    $("#black-white-image").css("margin-top", (($("#black-white-image-div").height() - $("#black-white-image").height()) / 2).toString() + "px");
    $("#color-image").css("margin-top", (($("#color-image-div").height() - $("#color-image").height()) / 2).toString() + "px");
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

            // set menu button position
            $("#menu-btn").css("width", $("#menu-btn").height().toString() + "px");
            $("#menu-btn").css("margin-top", (($("#answers-div").height() - $("#menu-btn").height()) / 2).toString() + "px");
            $("#menu-btn").css("margin-left", (($("#answers-div").width() - $("#menu-btn").width()) / 2).toString() + "px");

            // view first question
            viewQuestion(question);

            // animate buttons
            WinJS.UI.Animation.showPanel(document.getElementById("answer-btn1"), {left: "-1000px" });

            game.changeState(GameState.Running);
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