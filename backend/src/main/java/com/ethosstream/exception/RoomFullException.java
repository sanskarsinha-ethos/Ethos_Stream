package com.ethosstream.exception;

public class RoomFullException extends RuntimeException {
    public RoomFullException(String message) {
        super(message);
    }

    public RoomFullException(String code, int maxParticipants) {
        super("Room " + code + " is full (max " + maxParticipants + " participants)");
    }
}
