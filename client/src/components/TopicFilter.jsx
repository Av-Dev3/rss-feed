import React from 'react';
import './TopicFilter.css';

// Extract topics from feed names
function extractTopics(feeds) {
  const topicMap = new Map();
  
  feeds.forEach(feed => {
    const name = feed.name.toLowerCase();
    
    // Define topic keywords
    const topics = {
      'AI': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural', 'llm', 'gpt', 'openai', 'anthropic'],
      'Data Science': ['data science', 'data', 'analytics', 'big data', 'databricks', 'pandas', 'numpy'],
      'Tech News': ['tech', 'technology', 'news', 'gadget', 'device', 'hardware', 'software'],
      'Research': ['research', 'arxiv', 'paper', 'academic', 'journal', 'university', 'mit', 'stanford', 'berkeley'],
      'Programming': ['programming', 'code', 'developer', 'software', 'python', 'javascript', 'react', 'vue'],
      'Business': ['business', 'venture', 'startup', 'company', 'enterprise', 'corporate'],
      'Science': ['science', 'physics', 'biology', 'chemistry', 'nature', 'scientific'],
      'Robotics': ['robot', 'robotics', 'automation', 'autonomous']
    };
    
    // Find matching topic
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        if (!topicMap.has(topic)) {
          topicMap.set(topic, []);
        }
        topicMap.get(topic).push(feed.id);
        return;
      }
    }
    
    // Default to "Other" if no match
    if (!topicMap.has('Other')) {
      topicMap.set('Other', []);
    }
    topicMap.get('Other').push(feed.id);
  });
  
  return Array.from(topicMap.entries()).map(([topic, feedIds]) => ({
    topic,
    feedIds,
    count: feedIds.length
  })).sort((a, b) => b.count - a.count);
}

function TopicFilter({ feeds, selectedTopic, onTopicChange }) {
  const topics = extractTopics(feeds);
  
  return (
    <div className="topic-filter">
      <div className="topic-filter-header">
        <h3>Filter by Topic</h3>
        {selectedTopic && (
          <button className="topic-clear" onClick={() => onTopicChange(null)}>
            Clear
          </button>
        )}
      </div>
      <div className="topic-buttons">
        <button
          className={`topic-btn ${!selectedTopic ? 'active' : ''}`}
          onClick={() => onTopicChange(null)}
        >
          All ({feeds.length})
        </button>
        {topics.map(({ topic, count }) => (
          <button
            key={topic}
            className={`topic-btn ${selectedTopic === topic ? 'active' : ''}`}
            onClick={() => onTopicChange(topic)}
          >
            {topic} ({count})
          </button>
        ))}
      </div>
    </div>
  );
}

export default TopicFilter;

