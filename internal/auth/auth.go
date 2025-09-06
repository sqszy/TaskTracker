package auth

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type Claims struct {
	UserID int32 `json:"user_id"`
	jwt.RegisteredClaims
}

type Service struct {
	redis         *redis.Client
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

func NewService(r *redis.Client, accessSecret, refreshSecret string, accessTTL, refreshTTL time.Duration) *Service {
	return &Service{
		redis:         r,
		accessSecret:  []byte(accessSecret),
		refreshSecret: []byte(refreshSecret),
		accessTTL:     accessTTL,
		refreshTTL:    refreshTTL,
	}
}

func (s *Service) GenerateTokenPair(ctx context.Context, userID int32) (*TokenPair, error) {
	now := time.Now()
	accessExp := now.Add(s.accessTTL)
	refreshExp := now.Add(s.refreshTTL)

	accessClaims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(accessExp),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	accessTok := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessTok.SignedString(s.accessSecret)
	if err != nil {
		return nil, err
	}

	jti := uuid.NewString()
	refreshClaims := &Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			ExpiresAt: jwt.NewNumericDate(refreshExp),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	refreshTok := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshTok.SignedString(s.refreshSecret)
	if err != nil {
		return nil, err
	}

	key := "refresh:" + jti
	if err := s.redis.Set(ctx, key, strconv.Itoa(int(userID)), s.refreshTTL).Err(); err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresIn:    int64(s.accessTTL.Seconds()),
	}, nil
}

func (s *Service) ValidateAccessToken(tokenStr string) (int32, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return s.accessSecret, nil
	})
	if err != nil {
		return 0, err
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok || !tok.Valid {
		return 0, errors.New("invalid token")
	}
	return claims.UserID, nil
}

func (s *Service) Refresh(ctx context.Context, refreshStr string) (*TokenPair, error) {
	tok, err := jwt.ParseWithClaims(refreshStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return s.refreshSecret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok || !tok.Valid || claims.ID == "" {
		return nil, errors.New("invalid refresh token")
	}

	key := "refresh:" + claims.ID
	val, err := s.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, errors.New("refresh token revoked or not found")
	}
	if err != nil {
		return nil, err
	}

	if strconv.Itoa(int(claims.UserID)) != val {
		_ = s.redis.Del(ctx, key)
		return nil, errors.New("refresh token mismatch")
	}

	if err := s.redis.Del(ctx, key).Err(); err != nil {
		return nil, err
	}

	return s.GenerateTokenPair(ctx, claims.UserID)
}

func (s *Service) Revoke(ctx context.Context, refreshStr string) error {
	tok, err := jwt.ParseWithClaims(refreshStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return s.refreshSecret, nil
	})
	if err != nil {
		return err
	}
	claims, ok := tok.Claims.(*Claims)
	if !ok || claims.ID == "" {
		return errors.New("invalid refresh token")
	}
	key := "refresh:" + claims.ID
	return s.redis.Del(ctx, key).Err()
}
