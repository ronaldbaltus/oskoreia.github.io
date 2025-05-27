  // Calculate and display "days ago" for the time_modified_unfiltered field
  function timeElapsedString(dateStr) {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (!isNaN(date)) {
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return  `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  };