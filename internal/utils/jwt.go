package utils

import (
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenClaims struct {
	Email      string  `json:"email"`
	UserId     int64   `json:"userId"`
	Username   string  `json:"username"`
	ImgUrl     *string `json:"imgUrl"`
	Role       string  `json:"role"`
	IsVerified bool    `json:"is_verified"`
}

//TODO: refactor to a struct with config that takes jwtSecret

func GenerateToken(username string, imgUrl *string, email string, userId int64, role string, isVerified bool, tokenExpirationMins int, jwtSecret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":    email,
		"userId":   userId,
		"username": username,
		"imgUrl":   imgUrl,
		"role":     role,
		"exp":      time.Now().Add(time.Minute * time.Duration(tokenExpirationMins)).Unix(),
		// This is redundant, but it's a good practice to include it
		// because user can get the token either from mail or after being verified
		// included as an extra layer of security w/ low cost, in case of future changes
		"is_verified": isVerified,
	})
	return token.SignedString([]byte(jwtSecret))
}

func ValidateToken(tokenString string, jwtSecret string) (jwt.MapClaims, error) {
	token := strings.Replace(tokenString, "Bearer ", "", 1)
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		return claims, nil
	}
	return nil, err
}

func ParseClaims(claims jwt.MapClaims) TokenClaims {
	img, ok := claims["imgUrl"].(*string)
	if !ok {
		img = nil
	}

	return TokenClaims{
		Email:      claims["email"].(string),
		UserId:     int64(claims["userId"].(float64)),
		Username:   claims["username"].(string),
		ImgUrl:     img,
		Role:       claims["role"].(string),
		IsVerified: claims["is_verified"].(bool),
	}
}
