package com.webbanpc.shoestore.config;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

@SpringBootTest
@AutoConfigureMockMvc
@SuppressWarnings("null")
class SecurityConfigRegressionTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAllowPublicHomeEndpointForAnonymousUsers() throws Exception {
        mockMvc.perform(get("/api/v1/home"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldKeepGuestCheckoutRoutePublic() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRequireAuthenticationForAccountEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/account/orders"))
                .andExpect(isUnauthorizedOrForbidden());
    }

    @Test
    @WithMockUser(roles = "USER")
    void shouldForbidUserRoleOnAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAllowAdminRoleOnAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/orders"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldBlockAdminRoleFromSubmittingProductReviews() throws Exception {
        mockMvc.perform(post("/api/v1/shoes/demo-shoe/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rating": 5,
                                  "title": "Admin review",
                                  "body": "This should never be accepted."
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldDenyUnknownEndpointByDefault() throws Exception {
        mockMvc.perform(get("/api/v1/internal/should-not-exist"))
                .andExpect(status().isForbidden());
    }

    private ResultMatcher isUnauthorizedOrForbidden() {
        return result -> {
            int status = result.getResponse().getStatus();
            assertTrue(
                    status == 401 || status == 403,
                    () -> "Expected 401 or 403 but got " + status);
        };
    }
}
