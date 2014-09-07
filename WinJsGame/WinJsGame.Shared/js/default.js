// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=392286

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
    },
};

//var questions[] = null;
// TODO: select from loaded questions
var question =
    {
        black_white_img_url: "../images/silhouette-man-walking-full-black.png",
        full_color_img_url: "../images/silhouette-man-walking-full-black.png",
        answers : [
            "answer1",
            "answer2",
            "answer3",
            "answer4"
        ],
        correct_answer : 2 // counting from 0
    };

// TODO: random
var answers_map =
    {
        "answer-btn1": 3,
        "answer-btn2": 0,
        "answer-btn3": 1,
        "answer-btn4": 2,
    };

function onAnswerBtnClick(eventInfo) {
    if (GameState.Running != game.gameState) {
        // TODO: some error log
        return;
    }

    //alert($("#lost-div"));
    

    // get answer button id
    var answer_id = answers_map[eventInfo.target.id];

    if (question.correct_answer == question.answers[answer_id]) {
        // correct answer
        game.changeState(GameState.NextQeuestion);
        // TODO: show image
    }
    else {
        // incorrect answer, show fail
        game.changeState(GameState.Lost);
        // TODO: draw 'Lost'
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

            var answerBtns = document.getElementsByClassName("answer-btn");
            for (var i = 0; i < answerBtns.length; ++i) {
                answerBtns[i].addEventListener("click", onAnswerBtnClick, false);
            }

            $("#lost-div").css("top", ((window.screen.height - $("#lost-div").height()) / 2).toString() + "px");
            $("#lost-div").css("left", ((window.screen.width - $("#lost-div").width()) / 2).toString() + "px");

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