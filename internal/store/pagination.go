package store

import (
	"net/http"
	"strconv"
	"strings"
)

type PaginatedFeedQuery struct {
	Limit  int      `json:"limit" validate:"required,gte=1,lte=50"`
	Offset int      `json:"offset" validate:"gte=0"`
	Sort   string   `json:"sort" validate:"oneof=asc desc"`
	Tags   []string `json:"tags" validate:"omitempty"`
	Search string   `json:"search" validate:"omitempty"`
	Since  string   `json:"since" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
	Until  string   `json:"until" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"`
}

func (fq *PaginatedFeedQuery) Parse(r *http.Request) error {
	qs := r.URL.Query()

	limit := qs.Get("limit")
	if limit != "" {
		l, err := strconv.Atoi(limit)
		if err != nil {
			return err
		}
		fq.Limit = l
	}

	offset := qs.Get("offset")
	if offset != "" {
		o, err := strconv.Atoi(offset)
		if err != nil {
			return err
		}
		fq.Offset = o
	}

	sort := qs.Get("sort")
	if sort != "" {
		fq.Sort = sort
	}

	tags := qs.Get("tags")
	if tags != "" {
		fq.Tags = strings.Split(tags, ",")
	}

	search := qs.Get("search")
	if search != "" {
		fq.Search = search
	}

	since := qs.Get("since")
	if since != "" {
		fq.Since = since
	}

	until := qs.Get("until")
	if until != "" {
		fq.Until = until
	}

	return nil
}
