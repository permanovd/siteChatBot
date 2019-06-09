(function ($) {

    let chat = {};
    let serverInteractionService = {
        sendMessage: function (text, widget, messageNumber) {

            let str = JSON.stringify({
                message: text,
                message_number: messageNumber
            });

            let apiUrl = 'http://159.69.18.145';
            $.ajax({
                type: "POST",
                url: apiUrl + '/api/chat/message',
                data: str,
                beforeSend: function (request) {
                    request.setRequestHeader("X-Chat-Token", widget.options.accessToken);
                },
                success: function (data) {
                    let responseText = data.text;
                    let actions = data.actions;
                    widget.options.panel.appendMessage(responseText, actions, false)
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    let responseText = textStatus;
                    widget.options.panel.appendMessage('error', false)
                }
            });
        }
    };

    chat.options = {
        input: null,
        panel: null,
        button: null,
        accessToken: null,
        serverInteractionService: serverInteractionService,
    };

    chat._create = function () {
        this.options.button = this.element.find('.chat-text-submit-button');
        this.options.input = this.element.find('.chat-input');
        this.options.panel = this.element.find('.chat-panel');
        this.options.messageNumber = 1;

        this.options.onActionSelected = function (text, widget) {
            widget.options.panel.appendMessage(text, [], true);

            serverInteractionService.sendMessage(text, widget, widget.options.messageNumber)
            ++widget.options.messageNumber;
        };

        this.options.panel.appendMessage = (text, actions, fromUser) => {
            let element = this.options.panel;
            let find = element.find('.messages-container');
            find.append((fromUser ? '<div class="user-message">' : '<div class="server-message">') + text + '</div>');

            for (let iter in actions) {
                let action = actions[iter];
                find.append('<button class="proposed-action">' + action + '</button>');
            }

            let that = this;
            $('.proposed-action').on('click', function (e) {
                e.preventDefault();
                let selected = $(e.target).text();
                that.options.onActionSelected(selected, that);
            })
        };

        this.buildWidget();
    };

    chat.buildWidget = function () {
        let that = this;
        let input = this.options.input;
        let panel = this.options.panel;
        let serverInteractionService = this.options.serverInteractionService;
        this.options.button.on('click', function (e) {
            e.preventDefault();
            let text = input.val();
            if (text.trim() === '') {
                return;
            }

            input.val('');
            panel.appendMessage(text, [], true);

            serverInteractionService.sendMessage(text, that, that.options.messageNumber)
            ++that.options.messageNumber;
        });

        $.ajax({
            type: "POST",
            url: 'http://159.69.18.145/api/chat/handshake',
            data: [],
            success: function (data) {
                that.options.accessToken = data.token;
            },
            error: (jqXHR, textStatus, errorThrown) => {
            }
        });

        serverInteractionService.sendMessage('', that, that.options.messageNumber);
        ++that.options.messageNumber;
    };

    $.widget('custom.chat', chat);
    $('#chat').chat();

})(jQuery);