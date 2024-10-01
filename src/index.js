document.addEventListener("DOMContentLoaded", function() {

    getAllQuotes();

    function getAllQuotes() {
        fetch('http://localhost:3000/quotes') 
            .then(res => res.json())
            .then(quoteData => {
                quoteData.sort((a, b) => {
                    if (a.author < b.author) return -1;
                    if (a.author > b.author) return 1;
                    return 0;
                });
                quoteData.forEach(quote => {
                    fetch(`http://localhost:3000/likes?quoteId=${quote.id}`)
                    .then(res => res.json())
                    .then(likesData => {
                        const likesCount = likesData.length;
                        renderOneQuote(quote, likesCount);
                    })
                })
                
                    
            });
    }

    function renderOneQuote(quote, likesCount = 0) {
        let li = document.createElement('li');
        li.className = 'quote-card'
        li.id = `${quote.id}`
        li.innerHTML = `
        <blockquote class="blockquote">
            <p class="mb-0" type="">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <form class="edit-quote-form">
                <input type="hidden" name="quote" size="100" value="${quote.quote}" class="input-text"/>
                <input type="hidden" name="author" size= "20" value="${quote.author}" class="input-text"/>
                <input type="hidden" name="author" size= "20" value="${quote.id}" class="input-text"/>
                <input type="hidden" name="submit" value="Edit Quote" class="submit"/>
            </form>
            <br>
            <button class='btn-success'>Likes: <span>${likesCount}</span></button>
            <button class='btn-danger'>Delete</button>
            <button class='btn-edit'>Edit</button>                                                        
        </blockquote>
        `
        li.querySelector('.btn-edit').addEventListener('click', () => {
            li.querySelectorAll('.input-text')[0].type = "text";
            li.querySelectorAll('.input-text')[1].type = "text";
            li.querySelectorAll('.submit')[0].type = "submit";
        });

        li.getElementsByClassName('edit-quote-form')[0].addEventListener('submit', (e) => {
            e.preventDefault();
            let updateQuote ={
                id: e.target.getElementsByClassName('input-text')[2].value,
                quote: e.target.getElementsByClassName('input-text')[0].value,
                author: e.target.getElementsByClassName('input-text')[1].value
            }

            fetch(`http://localhost:3000/quotes/${updateQuote.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateQuote)
            })
            .then(res => res.json())
            .then(() => hideInput())
        })

        function hideInput() {
            li.querySelectorAll('.input-text')[0].type = "hidden";
            li.querySelectorAll('.input-text')[1].type = "hidden";
            li.querySelectorAll('.submit')[0].type = "hidden";
        }
        


        

        li.querySelector('.btn-danger').addEventListener('click', () => {
            fetch(`http://localhost:3000/quotes/${quote.id}`,{
                method:'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then((quote) => console.log(quote))
            li.remove();

        })

        li.querySelector('.btn-success').addEventListener('click', () => {
            console.log(li.id);
            let spanElement = li.querySelector('span');
            let currentLikes = parseInt(spanElement.textContent, 10);
            spanElement.textContent = currentLikes + 1;
            let likeObj = {
                quoteId: li.id.toString(),
                createdAt: Date.now()
            }
            console.log(likeObj);
            fetch('http://localhost:3000/likes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(likeObj)
            })
            .then(res => res.json())
            .then(like => console.log(like))
        })

        


        document.getElementById('quote-list').appendChild(li);
    }



    document.getElementById('new-quote-form').addEventListener('submit', (e) => {
        
        
        e.preventDefault();

        const quoteCards = document.querySelectorAll('#quote-list .quote-card');

        const ids = Array.from(quoteCards).map(card => parseInt(card.id));

        const highestId = Math.max(...ids);

        console.log(highestId);

        newestId = highestId + 1;

        let quoteObject = {
            id: newestId.toString(),
            quote: document.getElementById('new-quote').value,
            author: document.getElementById('author').value,
        }
        addNewQuote(quoteObject);
    })

    function addNewQuote(quoteObject) {
        fetch('http://localhost:3000/quotes',{
            method: 'POST',
            headers: {
             'Content-Type': 'application/json'
           },
            body:JSON.stringify(quoteObject)
          })
          .then(res => res.json())
          .then(quote => {
            console.log(quote);
            document.getElementById('quote-list').innerHTML = "";
            getAllQuotes();
        })
    }

})