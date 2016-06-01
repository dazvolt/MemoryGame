$(document).ready(function () {
    $('body').gameMemory();
});

$.widget('custom.gameMemory', {
    options: {
        startNumbersCapacity: 3,
        startDecayTimer: 2000,
        startNumberToShow: 1,
        isLocked: true,
        round: 0,
        score: 0,
        grid: [5, 5],
        difficulty: 0,
        timeAttack: 10,
        timeAttackMultiplier: 1,
        counter: 0
    },

    _init: function () {
        this._choose();
    },

    _roll: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _generate: function () {

        for (var i = 0; i < (this.options.grid[0] * this.options.grid[1]); i++) {
            $('#map').append('<div class="tile"></div>');
        }

        if (this.options.difficulty == 1) {
            $('#map').addClass('small');
        } else
        if (this.options.difficulty == 2) {
            $('#map').addClass('medium');
        } else
        if (this.options.difficulty == 4) {
            $('#map').addClass('large');
        } else
        if (this.options.difficulty == 5) {
            $('#map').addClass('giant');
        }

        $('.tile').css({
            width: (100 / this.options.grid[0]) + 'vw',
            height: (100 / this.options.grid[1]) + 'vh'
        });

        this.nextRound();
    },

    _choose: function () {
        var self = this;
        var getScore = localStorage.getItem('score');

        $('#start').show();
        $('.scores .result').text(getScore);
        $('#start .difficulty .options').on('click', function () {
            var choose = $(this).index();

            if (choose === 0) {
                self.options.grid = [4, 4];
                self.options.startNumbersCapacity = 1;
                self.options.difficulty = 1;
                self.options.timeAttack = 10;
            } else
            if (choose === 1) {
                self.options.grid = [6, 6];
                self.options.startNumbersCapacity = 2;
                self.options.difficulty = 2;
                self.options.timeAttack = 7;
            } else
            if (choose === 2) {
                self.options.grid = [10, 10];
                self.options.difficulty = 3;
                self.options.startNumbersCapacity = 3;
                self.options.timeAttack = 5;
            } else
            if (choose === 3) {
                self.options.grid = [15, 15];
                self.options.difficulty = 4;
                self.options.startNumbersCapacity = 4;
                self.options.timeAttack = 4;
            } else
            if (choose === 4) {
                self.options.grid = [25, 25];
                self.options.difficulty = 5;
                self.options.startNumbersCapacity = 5;
                self.options.timeAttack = 3;
            }

            if ($('#start input').prop('checked')) {
                $('.timebar').show();
                self.options.timeAttackMultiplier = 2;
            }

            $('#start').hide();
            $('.scores').hide();
            self._generate();
        });
    },

    _randomizer: function () {
        $('#map .tile').removeAttr('number').text('').css('background', 'black');

        for (var ic = 1; ic < (this.options.startNumbersCapacity + 1); ic++) {
            var newRand = this._roll(0, (this.options.grid[0] * this.options.grid[1])) - 1;

            if (newRand < 0) newRand = 0;

            if ($('#map .tile:eq(' + newRand + ')').text() != '') {
                this._randomizer();

                return 0;
            } else {
                $('#map .tile:eq(' + newRand + ')').text(ic).attr('number', ic);
            }
        }
    },

    nextRound: function () {
        var self = this,
            width = 100,
            step = (width / this.options.timeAttack) / 20,
            interval;

        this.options.round++;
        this.options.counter = 0;
        $('.timebar span').css('width', '100%');

        this._randomizer();

        setTimeout(function () {
            $('#map .tile').text('');
            self.options.isLocked = false;
            if (self.options.timeAttackMultiplier == 2) {
                interval = setInterval(function () {
                    width = width - step;
                    $('.timebar span').stop().animate({
                        width: width + '%'
                    }, 50);
                    self.options.counter += 50;
                    if (width <= 0) {
                        clearInterval(interval);
                        self._lose();
                    }
                }, 50);
            }
        }, self.options.startDecayTimer);

        $('#map .tile').on('click', function () {

            if (!self.options.isLocked) {

                if (self.options.startNumberToShow <= self.options.startNumbersCapacity) {

                    if ($(this).attr('number') == self.options.startNumberToShow) {
                        $(this).text(self.options.startNumberToShow).css('background', 'green');

                        if (self.options.difficulty > 3) {
                            self.options.score += 100 * self.options.difficulty * self.options.timeAttackMultiplier * 2.5;
                        } else {
                            self.options.score += 100 * self.options.difficulty * self.options.timeAttackMultiplier;
                        }

                        if (self.options.startNumberToShow >= self.options.startNumbersCapacity) {
                            clearInterval(interval);
                            $('.timebar span').css('width', '100%');
                            self._win();
                        }

                        self.options.startNumberToShow++;

                    } else
                    if ($(this).attr('number') != self.options.startNumberToShow) {
                        $(this).text($(this).attr('number')).css('background', '#AD1313');
                        $('.timebar span').css('width', '100%');
                        clearInterval(interval);
                        self._lose();
                    } else
                    if (!$(this).attr('number')) {
                        self._lose();
                        $('.timebar span').css('width', '100%');
                        clearInterval(interval);
                    }
                }
            }
        });
    },

    _win: function () {
        var self = this;
        var timeLeft = (this.options.timeAttack * 1000) - this.options.counter;

        if (this.options.timeAttackMultiplier == 2) {

            if (self.options.difficulty > 3) {
                this.options.score += timeLeft * (self.options.difficulty * 5);
            } else {
                this.options.score += timeLeft * self.options.difficulty;
            }

            $('#message').text('You win round ' + this.options.round + '! TimeAttack Bonus: +' + (timeLeft * self.options.difficulty) + ' Score points! Next...').show();
        } else {
            $('#message').text('You win round ' + this.options.round + '! Next...').show();
        }

        $('#map .tile').unbind('click');
        $('#map .tile').css('background', 'green');

        self.options.score += 1000 * self.options.difficulty;
        self.options.isLocked = true;
        self.options.startNumberToShow = self.options.startNumberToShow - self.options.startNumbersCapacity;
        self.options.startNumbersCapacity++;
        self.options.startDecayTimer = self.options.startDecayTimer + 500;

        setTimeout(function () {
            $('#message').hide();
            self.nextRound();
        }, 3000);
    },

    _lose: function () {
        var self = this,
            difficulty = '',
            getScore = localStorage.getItem('score');

        if (self.options.score > getScore) {
            localStorage.setItem('score', self.options.score);
        }

        if (this.options.difficulty == 1) {
            difficulty = '"I\'m bo-bo baby"';
        } else if (this.options.difficulty == 2) {
            difficulty = '"Lets try harder"';
        } else if (this.options.difficulty == 3) {
            difficulty = '"Hurt me plenty"';
        } else if (this.options.difficulty == 4) {
            difficulty = '"Nightmare"';
        } else if (this.options.difficulty == 5) {
            difficulty = '"Insane"';
        }

        $('#map .tile').unbind('click');
        $('#map .tile').css('background', 'rgb(109, 2, 2)');

        $('#message').html('You lost on round ' + this.options.round + ' <div>with difficulty </div>' +
        '<div>'+difficulty+'</div> ' +
        '<div>Score: ' + self.options.score + ' </div><div class="restart">restart</div>').show();

        $('#map .tile').each(function () {

            if ($(this).attr('number')) {

                if ($(this).attr('number') == self.options.startNumberToShow) {
                    $(this).css('background', 'red');
                }
                $(this).text($(this).attr('number'));
            }
        });

        $('#message .restart').on('click', function () {
            location.reload(true);
        });

        self.options.isLocked = true;
    }

});