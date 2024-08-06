document.getElementById('uploadForm').onsubmit = async function(event) {
    event.preventDefault();
    document.getElementById('results').innerHTML = '<p>Analyzing...</p>';
    const formData = new FormData();
    formData.append('image', document.getElementById('imageInput').files[0]);
  
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      let resultsHtml = '<h2>Calories Information</h2>';
      resultsHtml += '<table>';
      resultsHtml += '<tr><th>Ingredient</th><th>Quantity</th><th>Calories</th></tr>';
      data.results.forEach(result => {
        resultsHtml += `<tr><td>${result.ingredient}</td><td>${result.quantity}</td><td>${result.calories}</td></tr>`;
      });
      resultsHtml += '</table>';
      resultsHtml += `<h3>Total Calories: ${data.totalCalories}</h3>`;
      document.getElementById('results').innerHTML = resultsHtml;
    } catch (error) {
      document.getElementById('results').innerHTML = '<p>Error analyzing image.</p>';
      console.error('Error analyzing image:', error);
    }
  }
  