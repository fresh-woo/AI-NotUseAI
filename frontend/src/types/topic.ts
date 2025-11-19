export interface Topic {
  id: string;
  name: string;
  icon: string;
  link: string;
}

export interface SelectedTopic extends Topic {
  order: number;
}

export interface UserTopic extends Topic {
  isUserCreated: true;
  createdAt: number;
  goalId?: string;
  keywords?: string;
  findings?: string;
}
