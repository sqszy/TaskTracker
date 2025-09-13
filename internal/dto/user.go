package dto

type UserDTO struct {
	ID    int32  `json:"id"`
	Email string `json:"email"`
}

type SignupRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}
type SignupResponse UserDTO

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}
