import { type ReactNode, useLayoutEffect, useRef } from "react";
import { Avatar } from "./art";
import { Glass } from "./glass";
import { Icon } from "./icons";

interface Chat {
  name: string;
  preview: string;
  time: string;
}

interface Message {
  author?: string;
  id: string;
  image?: string;
  outgoing?: boolean;
  text: string;
  time: string;
}

const CHATS: Chat[] = [
  { name: "Design Team", preview: "Nora: Shipping it today?", time: "9:41" },
  { name: "Alex Rivera", preview: "Sending the files now", time: "8:35" },
  { name: "Weekend Hike", preview: "Sam: Saturday at nine?", time: "7:47" },
  {
    name: "Frontend Guild",
    preview: "WebGL 2 runs everywhere now",
    time: "6:12",
  },
  { name: "Nora Kim", preview: "Thanks, looks great", time: "5:22" },
  { name: "Studio Updates", preview: "The new palette is live", time: "4:51" },
  { name: "Leo Park", preview: "See you tomorrow", time: "Mon" },
  { name: "Mia Torres", preview: "Voice message", time: "Sun" },
];

const MESSAGES: Message[] = [
  {
    author: "Mia",
    id: "bauhaus",
    image: "/backdrops/1.webp",
    text: "New backdrop for the playground: Bauhaus tiles, flat colors, no shadows.",
    time: "9:12",
  },
  {
    author: "Sam",
    id: "stripes",
    text: "Love it. The stripes bend really nicely under the glass.",
    time: "9:14",
  },
  {
    id: "agree",
    outgoing: true,
    text: "Agreed, the refraction finally reads at a glance.",
    time: "9:15",
  },
  {
    author: "Mia",
    id: "memphis",
    image: "/backdrops/3.webp",
    text: "And the Memphis one, with rings and hatching right in the middle.",
    time: "9:21",
  },
  {
    id: "arches",
    image: "/backdrops/2.webp",
    outgoing: true,
    text: "Arches got the same treatment: dense rainbow bands behind the card.",
    time: "9:30",
  },
  {
    author: "Nora",
    id: "ship",
    text: "Shipping it today?",
    time: "9:38",
  },
  {
    id: "video",
    outgoing: true,
    text: "Yes, right after the video.",
    time: "9:41",
  },
];

const AUTHOR_TONES: Record<string, number> = { Mia: 0, Nora: 1, Sam: 2 };

function ChatRow(props: {
  active: boolean;
  chat: Chat;
  index: number;
}): ReactNode {
  const { active, chat, index } = props;

  return (
    <li className={active ? "chat chat--active" : "chat"}>
      <Avatar name={chat.name} size={48} tone={index} />

      <span className="chat__text">
        <span className="chat__top">
          <span className="chat__name">{chat.name}</span>
          <span className="chat__time">{chat.time}</span>
        </span>

        <span className="chat__preview">{chat.preview}</span>
      </span>
    </li>
  );
}

function Bubble(props: { message: Message }): ReactNode {
  const { message } = props;

  const className = message.outgoing ? "bubble bubble--out" : "bubble";

  return (
    <div className={className}>
      {message.image ? (
        <img
          alt=""
          className="bubble__image"
          height={240}
          src={message.image}
          width={384}
        />
      ) : null}

      <div className="bubble__body">
        {message.author ? (
          <span
            className={`bubble__author bubble__author--${AUTHOR_TONES[message.author]}`}
          >
            {message.author}
          </span>
        ) : null}

        <span>{message.text}</span>

        <span className="bubble__time">{message.time}</span>
      </div>
    </div>
  );
}

export function Messages(): ReactNode {
  const feedRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(function scrollToLatest() {
    const feed = feedRef.current;

    if (!feed) {
      return;
    }

    feed.scrollTop = feed.scrollHeight;
  }, []);

  return (
    <div className="screen messages">
      <aside className="messages__list">
        <header className="messages__header">
          <span className="messages__title">Chats</span>

          <span className="messages__compose">
            <Icon name="compose" />
          </span>
        </header>

        <span className="messages__search">
          <Icon name="search" size={18} />
          Search
        </span>

        <ul className="messages__chats">
          {CHATS.map(function renderChat(chat, index) {
            return (
              <ChatRow
                active={index === 0}
                chat={chat}
                index={index}
                key={chat.name}
              />
            );
          })}
        </ul>
      </aside>

      <section className="messages__chat">
        <div className="messages__feed" ref={feedRef}>
          <div className="messages__day">
            <Glass height={34} tint={0.5} width={88}>
              <span className="glass-label glass-label--small">Today</span>
            </Glass>
          </div>

          {MESSAGES.map(function renderMessage(message) {
            return <Bubble key={message.id} message={message} />;
          })}
        </div>

        <div className="messages__bar messages__bar--top">
          <Glass height={60} tint={0.5} width="100%">
            <span className="glass-row">
              <Icon name="back" />

              <Avatar name="Design Team" size={40} tone={0} />

              <span className="glass-stack">
                <span className="glass-label">Design Team</span>
                <span className="glass-caption">8 members, 3 online</span>
              </span>
            </span>
          </Glass>

          <Glass height={60} width={124}>
            <span className="glass-icons">
              <Icon name="search" />
              <Icon name="more" />
            </span>
          </Glass>
        </div>

        <div className="messages__bar messages__bar--bottom">
          <Glass height={56} width={56}>
            <Icon name="attach" />
          </Glass>

          <Glass height={56} tint={0.5} width="100%">
            <span className="glass-row glass-row--muted">Message</span>
          </Glass>

          <Glass height={56} width={56}>
            <Icon name="microphone" />
          </Glass>
        </div>
      </section>
    </div>
  );
}
