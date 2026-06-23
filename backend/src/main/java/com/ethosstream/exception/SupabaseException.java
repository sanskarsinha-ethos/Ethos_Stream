package com.ethosstream.exception;

public class SupabaseException extends RuntimeException {
    public SupabaseException(String message) {
        super(message);
    }

    public SupabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}
