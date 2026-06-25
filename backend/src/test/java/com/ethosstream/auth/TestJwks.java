package com.ethosstream.auth;
import io.jsonwebtoken.security.Jwks;
import io.jsonwebtoken.security.JwkSet;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Locator;
import io.jsonwebtoken.security.Jwk;
import io.jsonwebtoken.JwsHeader;
import java.security.Key;
public class TestJwks {
    public void test() {
        String json = "{}";
        JwkSet jwkSet = Jwks.setParser().build().parse(json);
        Jwts.parser().keyLocator(header -> {
            if (header instanceof JwsHeader) {
                String kid = ((JwsHeader) header).getKeyId();
                if (kid != null && jwkSet != null) {
                    for (Jwk<?> jwk : jwkSet.getKeys()) {
                        if (kid.equals(jwk.getId())) {
                            return jwk.toKey();
                        }
                    }
                }
            }
            return null;
        }).build();
    }
}
