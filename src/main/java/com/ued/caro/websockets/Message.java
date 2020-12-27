package com.ued.caro.websockets;

import java.util.Map;

public class Message {
    private String topic;
    private Map<String, Object> payload;

    public Message(String topic, Map<String, Object> payload) {
        this.topic = topic;
        this.payload = payload;
    }

    public void set(String key, Object data) {
        this.payload.put(key, data);
    }

    public String getTopic() {
        return topic;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }


}
