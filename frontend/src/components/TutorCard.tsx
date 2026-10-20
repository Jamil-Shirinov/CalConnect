interface TutorCardProps {
  name: string;
  course: string;
  rating: number;
  matchScore: number;
  price: number;
  image?: string;
}

export default function TutorCard({
  name,
  course,
  rating,
  matchScore,
  price,
  image,
}: TutorCardProps) {
  return (
    <div className="tutor-card">

      <div className="tutor-header">
        {image && (
          <img
            src={image}
            alt={name}
            className="tutor-image"
          />
        )}

        <div>
          <h3>{name}</h3>
          <p>{course}</p>
        </div>
      </div>

      <div className="match-score">
        {matchScore}% Match
      </div>

      <div className="tutor-info">
        <span>⭐ {rating}</span>
        <span>${price}/hr</span>
      </div>

      <button>
        View Match
      </button>

    </div>
  );
}