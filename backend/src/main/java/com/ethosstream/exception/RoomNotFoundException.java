package com.ethosstream.exception;

public class RoomNotFoundException extends RuntimeException {
    public RoomNotFoundException(String message) {
        super(message);
    }

    public RoomNotFoundException(String code, Throwable cause) {
        super("Room not found with code: " + code, cause);
    }
}
