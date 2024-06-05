document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const queryInput = document.getElementById('query');
    const numPostsInput = document.getElementById('num-posts');
    const loader = document.getElementById('loader');
    const titleRatingsContainer = document.getElementById('title-ratings');
    const totalRatingContainer = document.getElementById('total-rating');

    function analyzeQuery() {
        const query = queryInput.value;
        const numPosts = parseInt(numPostsInput.value) || 100; 

        if (!query) {
            alert('يرجى إدخال كلمة للبحث.');
            return;
        }

        loader.style.display = 'block';

        fetch(`http://localhost:5000/analyze?query=${query}&limit=${numPosts}`)
            .then(response => response.json())
            .then(data => {
                loader.style.display = 'none';

                if (data.error) {
                    alert(data.error);
                    return;
                }

                titleRatingsContainer.innerHTML = '';
                totalRatingContainer.innerHTML = '';

                let totalPositive = 0;
                let totalNegative = 0;

                data.title_ratings.forEach(rating => {
                    const ratingDiv = document.createElement('div');
                    ratingDiv.classList.add('card', 'rating');

                    let sentimentLabel = '';
                    let emoji = '';
                    
                    if (rating.score >= 0.7) {
                        sentimentLabel = 'إيجابي';
                        emoji = '😊';
                        ratingDiv.classList.add('positive');
                        totalPositive += 1;
                        style= 'background-color: #3ecd5e';
                    } else if (rating.score < 0.5) {
                        sentimentLabel = 'سلبي';
                        emoji = '😞';
                        ratingDiv.classList.add('negative');
                        totalNegative += 1;
                        style= 'background-color: #e44002';
                    } else {
                        sentimentLabel = 'محايد';
                        emoji = '😐';
                        ratingDiv.classList.add('neutral');
                    }

                    ratingDiv.innerHTML = `
                        
                        <div class="ag-courses_item">
      <div  class="ag-courses-item_link">
        <div class="ag-courses-item_bg" style=${style}></div>

        <div class="ag-courses-item_title">
        العنوان: ${rating.title}
        </div>

        <div class="ag-courses-item_date-box">
        الحالة:
          <span class="ag-courses-item_date">
          ${sentimentLabel} ${emoji}
          </span>
        </div>
        <div class="ag-courses-item_date-box">
        النقاط:
          <span class="ag-courses-item_date">
          ${rating.score.toFixed(2)}
          </span>
        </div>
      </div>
    </div>

                    `;

                    titleRatingsContainer.appendChild(ratingDiv);
                });

                totalRatingContainer.innerHTML = `
                    <h3>الإجمالي:</h3>
                    <p>إيجابي: ${totalPositive}</p>
                    <p>سلبي: ${totalNegative}</p>
                `;
            })
            .catch(error => {
                loader.style.display = 'none';
                alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
                console.error(error);
            });
    }

    function clearContent() {
        queryInput.value = '';
        numPostsInput.value = '';
        titleRatingsContainer.innerHTML = '';
        totalRatingContainer.innerHTML = '';
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeQuery);
    } else {
        console.error('Could not find the analyze button element.');
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearContent);
    } else {
        console.error('Could not find the clear button element.');
    }
});
