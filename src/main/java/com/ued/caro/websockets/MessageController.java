package com.ued.caro.websockets;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller
public class MessageController {
    private List<String> players = new ArrayList<>();

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public Message send(final Message message) throws Exception {
        if (message.getTopic().equals("join")) {
            String player = (String) message.getPayload().get("name");
            if (this.players.size() < 2) {
                this.players.add(player);
            }
            message.set("players", this.players);
        }
        if (message.getTopic().equals("left")) {
            // user left game
            List<String> newPlayers = new ArrayList<>();
            for (String player : this.players) {
                String name = (String) message.getPayload().get("player");
                if (!player.equals(name)) {
                    newPlayers.add(player);
                }
            }
            this.players = newPlayers;
            message.set("players", this.players);
        }
        return message;
    }

}