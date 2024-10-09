import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [id, setId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (fileType: 'pdf' | 'zip') => {
    setLoading(true);
    setError(null);
    let take = 0;
    let limit = 0;
    let skip = 0;
    if (fileType === 'pdf') {
      take = 1;
      limit = 1;
    }
    if (fileType === 'zip') {
      take = 5;
      limit = 5;
    }
    try {
      // Send a GET request to the server to download the file
      const params = new URLSearchParams({
        take: take.toString(),
        limit: limit.toString(),
        skip: skip.toString(),
        checklistIds: id,
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/checklist-export-pdf?${params}`, {
        method: 'GET',
        headers: {
          'key': process.env.REACT_APP_KEY || '',
          'token': process.env.REACT_APP_TOKEN || '',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Get the content-disposition header
      const contentDisposition = response.headers.get('content-disposition') || '';

      // Extract the filename from the content-disposition header
      const fileName = contentDisposition.split('filename=')[1]?.replace(/"/g, '') || `download.${fileType}`;

      // Get the response data as a Blob
      const blob = await response.blob();

      // Create a URL for the downloaded file
      const url = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);

      // Append the link to the document body and trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // Handle any errors that occur during the download
      setError('Failed to download the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Welcome to PDF ticket download</h1>
      </header>
      <article className="app-container">
        <p className="app-description">
          Enter the ticket ID below to download the PDF ticket.
        </p>
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Enter Ticket ID"
          className="app-input"
        />
        <button onClick={() => handleDownload('pdf')} disabled={loading} className="app-button">
          {loading ? 'Downloading...' : 'Download PDF'}
        </button>
        <button onClick={() => handleDownload('zip')} disabled={loading} className="app-button">
          {loading ? 'Downloading...' : 'Download ZIP'}
        </button>
        {error && <p className="app-error">{error}</p>}
      </article>
    </div>
  );
};

export default App;
