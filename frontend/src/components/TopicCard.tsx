import { Topic } from "../types/topic";

interface TopicCardProps {
  topic: Topic;
  isSelected?: boolean;
  order?: number;
  onClick?: () => void;
  onDelete?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isSelected = false,
  order,
  onClick,
  onDelete,
}) => {
  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-2
        rounded-3xl p-4 min-[50px] transition-all duration-100
        ${
          isSelected
            ? "bg-black text-gray-500"
            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-600"
        }
      `}
    >
      {isSelected && order !== undefined && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-black text-sm font-semibold">{order}</span>
        </div>
      )}

      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-600"
          aria-label={`${topic.name} 삭제`}
        >
          🗑️
        </button>
      )}

      <span className="text-3xl">{topic.icon}</span>
      <span
        className={`text-sm font-medium ${
          isSelected ? "text-white" : "text-gray-700"
        }`}
      >
        {topic.name}
      </span>
    </button>
  );
};
