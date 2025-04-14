type Feed struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Formula  Formula            `json:"formula"       bson:"formula"`
	Metadata Metadata           `json:"metadata"      bson:"metadata"`
}

type Formula struct {
	Shape string `json:"shape" bson:"shape"`
	Name  string `json:"name"  bson:"name"`
	Expr  string `json:"expr"  bson:"expr"`
}

type Metadata struct {
	Name        string    `json:"name"        bson:"name"`
	Description string    `json:"description" bson:"description"`
	CreatedAt   time.Time `json:"created_at"  bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"  bson:"updated_at"`
	DeletedAt   time.Time `json:"deleted_at"  bson:"deleted_at"`
}