import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
      import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

      const firebaseConfig = {
        apiKey: "AIzaSyCWpp7vH0FAubDAW1Gvw5LMmtEqfMIq4u0",
        authDomain: "niat-admission-form.firebaseapp.com",
        projectId: "niat-admission-form",
        storageBucket: "niat-admission-form.firebasestorage.app",
        messagingSenderId: "907218345703",
        appId: "1:907218345703:web:57e6dd3d74baab2f190c42",
        measurementId: "G-YPCVGYS7L9"
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      const loginBtn = document.getElementById('google-login-btn');
      const logoutBtnTop = document.getElementById('logout-btn-top');
      const logoutBtnBottom = document.getElementById('logout-btn-bottom');

      if(loginBtn) {
        loginBtn.addEventListener('click', () => {
          signInWithPopup(auth, provider).catch((error) => { alert("Login Failed: " + error.message); });
        });
      }

      const handleLogout = () => {
        signOut(auth).then(() => {
          // 1. Hide Views
          document.getElementById('form-section').classList.add('hidden');
          document.getElementById('success-view').classList.add('hidden');
          document.getElementById('login-section').classList.remove('hidden');
          
          // 2. Reset Form Data
          const form = document.getElementById('admissionForm');
          if(form) form.reset();
          
          // 3. THIS IS THE NEW PART: Remove the blue color from all fields
          const filledInputs = document.querySelectorAll('.filled-input');
          filledInputs.forEach(input => input.classList.remove('filled-input'));

          // 4. Reset Payment & Button States
          document.getElementById('online-payment-section').classList.remove('hidden');
          
          // Reset file names text
          const fileSpans = document.querySelectorAll('.file-name-display');
          fileSpans.forEach(span => span.textContent = 'No file added');
          
          const btn = document.getElementById('submit-btn');
          if(btn) {
              btn.classList.remove('loading', 'success');
              btn.disabled = false;
          }
        }).catch((error) => {
          alert("Error signing out: " + error.message);
        });
      };


      if(logoutBtnTop) logoutBtnTop.addEventListener('click', handleLogout);
      if(logoutBtnBottom) logoutBtnBottom.addEventListener('click', handleLogout);

      onAuthStateChanged(auth, (user) => {
        if (user) {
          document.getElementById('login-section').classList.add('hidden');
          if(document.getElementById('success-view').classList.contains('hidden')){
             document.getElementById('form-section').classList.remove('hidden');
          }
          const emailF = document.getElementById('email-field');
          const nameF = document.getElementById('user-display-name');
          if(emailF) {
              emailF.value = user.email;
              emailF.classList.add('filled-input'); // Force Blue Color immediately
          }
          if(nameF) nameF.innerText = user.displayName;
        } else {
          document.getElementById('login-section').classList.remove('hidden');
          document.getElementById('form-section').classList.add('hidden');
        }
      });

// --- NEW CODE (ADDED) ---
const URL_ARIKUCHI = "https://script.google.com/macros/s/AKfycbwAuL-1Il5Ux9MS_DPUU20w7C-h1QVZP8oJ2_XXWAlqbnwXKS51WD99NDGGwHMzk3AL/exec"; 
const URL_BAGALS   = "https://script.google.com/macros/s/AKfycbxvaMe5DDUsEOzyrsI0mjmr0IBAA9HhDpE8l_G54p_NIIPY60ol2aBXfI2qQtH7BcP8/exec";
const MAX_SIZE = 1 * 1024 * 1024; // 1MB Limit

            function checkFileSize(fileInput) {
        const displayId = fileInput.id + "-name";
        const display = document.getElementById(displayId);

        if(fileInput.files.length > 0) {
            if(fileInput.files[0].size > MAX_SIZE) {
                alert("File is too big! Max size is 1MB.");
                fileInput.value = ""; 
                if(display) display.textContent = "No file added";
            } else {
                // Update text to show filename
                if(display) display.textContent = fileInput.files[0].name;
            }
        } else {
            // User opened dialog but clicked Cancel (reset text)
            if(display) display.textContent = "No file added";
        }
            }

      
      const photoF = document.getElementById('photoFile');
      const docF = document.getElementById('docFile');
      const payF = document.getElementById('payFile');

      if(photoF) photoF.addEventListener('change', function() { checkFileSize(this) });
      if(docF) docF.addEventListener('change', function() { checkFileSize(this) });
      if(payF) payF.addEventListener('change', function() { checkFileSize(this) });

      // --- PAYMENT MODE TOGGLE ---
      const payRadios = document.querySelectorAll('input[name="payMode"]');
      const onlineSection = document.getElementById('online-payment-section');
      
      payRadios.forEach(radio => {
          radio.addEventListener('change', function() {
              if(this.value === 'Online') {
                  onlineSection.classList.remove('hidden');
              } else {
                  onlineSection.classList.add('hidden');
              }
          });
      });

      const selects = document.querySelectorAll('.course-select');
selects.forEach(select => {
  select.addEventListener('change', function() {
    if(this.value !== "") {
        selects.forEach(other => { 
            // OPEN BRACE START
            if(other !== this) { 
                other.value = ""; 
                other.classList.remove('filled-input'); 
            } 
            // CLOSE BRACE END
        });
    }
  });
});

      // --- SUBMIT & PREVIEW LOGIC ---
      const form = document.getElementById('admissionForm');
      const previewModal = document.getElementById('preview-modal');
      const previewDataBox = document.getElementById('preview-data');
      const finalSubmitBtn = document.getElementById('final-submit-btn');
      const editBtn = document.getElementById('edit-btn');
      const editBtnAction = document.getElementById('edit-btn-action');
      const finalSpinner = document.getElementById('final-spinner');

      // 1. PREVIEW BUTTON CLICK
      if (form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // Basic Validation
            if(!document.getElementById('declaration').checked) {
                alert("Please tick the declaration box."); return;
            }
            if(document.getElementById('photoFile').files.length === 0) {
                alert("Please upload your Passport Photo."); return; 
            }
            if(document.getElementById('docFile').files.length === 0) {
                alert("Please upload your Qualification Document."); return; 
            }
            const payMode = document.querySelector('input[name="payMode"]:checked').value;
            if (payMode === 'Online' && document.getElementById('payFile').files.length === 0) {
                alert("Please upload the Payment Screenshot."); return;
            }

            // READ PAYMENT IMAGE FOR PREVIEW (Async)
            const payFilePromise = (payMode === 'Online') ? getFileData('payFile') : Promise.resolve({data:null});

            payFilePromise.then(payFileResult => {
                
                // Helper to get course
                let selectedCourse = "";
                document.querySelectorAll('.course-select').forEach(s => { if(s.value) selectedCourse = s.value; });

                // BUILD DETAILED FIELDS
                const fields = [
                    { label: "Branch", val: document.getElementById('branch-select').value },
                    { label: "Student Name", val: document.getElementsByName('studentName')[0].value },
                    { label: "Father's Name", val: document.getElementsByName('fatherName')[0].value },
                    { label: "Email", val: document.getElementById('email-field').value },
                    { label: "Contact", val: document.getElementsByName('contact')[0].value },
                    
                    // SPLIT ADDRESS
                    { label: "Village/Town", val: document.getElementsByName('village')[0].value },
                    { label: "Post Office", val: document.getElementsByName('po')[0].value },
                    { label: "District", val: document.getElementsByName('district')[0].value },
                    { label: "PIN Code", val: document.getElementsByName('pin')[0].value },
                    
                    { label: "Qualification", val: document.getElementsByName('qualification')[0].value },
                    { label: "Activity", val: document.getElementsByName('activity')[0].value },
                    { label: "Course Applied", val: selectedCourse },
                    
                    { label: "Payment Mode", val: payMode },
                    { label: "Payment Proof", val: payFileResult.data, isImage: true } // Image Logic
                ];

                let htmlTable = `<table class="preview-table">`;
                fields.forEach(field => {
                    if(field.val && field.val !== "") {
                        let content = field.val;
                        // If it's the image field and we have data
                        if(field.isImage && field.val) {
                             content = `<img src="${field.val}" class="payment-proof-img" onclick="window.open('${field.val}')" title="Click to zoom">`;
                        } else if (field.isImage) {
                            content = "Not Applicable";
                        }

                        htmlTable += `<tr>
                            <td class="pt-label">${field.label}</td>
                            <td class="pt-val">${content}</td>
                        </tr>`;
                    }
                });
                htmlTable += `</table>`;

                previewDataBox.innerHTML = htmlTable;
                previewModal.classList.remove('hidden');
            });
          });
      }

      // 2. CLOSE MODAL LISTENERS
      [editBtn, editBtnAction].forEach(btn => {
          if(btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                previewModal.classList.add('hidden');
            });
          }
      });

            // 3. FINAL SUBMIT ANIMATION & LOGIC
      if(finalSubmitBtn) {
          finalSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // --- A. FREEZE LAYOUT (Prevents Jumping Lines) ---
            const modalContent = document.querySelector('.modal-content');
            // Lock the height to its current pixel value
            modalContent.style.height = modalContent.offsetHeight + 'px'; 
            
            // --- B. SETUP BUTTON COORDINATES ---
            const rect = finalSubmitBtn.getBoundingClientRect();
            finalSubmitBtn.style.width = rect.width + 'px';
            finalSubmitBtn.style.height = rect.height + 'px';
            finalSubmitBtn.style.left = rect.left + 'px';
            finalSubmitBtn.style.top = rect.top + 'px';
            finalSubmitBtn.style.position = 'fixed'; 
            
            void finalSubmitBtn.offsetWidth; // Force Reflow

            // --- C. START TRANSITION ---
            // 1. Fade out background
            document.querySelector('.main-wrapper').classList.add('page-fade-out');
            document.querySelector('.bg-pattern').style.opacity = '0';
            
            // 2. Blur and Fade out modal internals
            document.querySelector('.modal-header').classList.add('modal-content-fade');
            document.querySelector('#preview-data').classList.add('modal-content-fade');
            // Select the Edit button specifically
            const editBtnEl = document.getElementById('edit-btn-action');
            if(editBtnEl) editBtnEl.classList.add('modal-content-fade');

            // 3. Make the box container transparent so only the button remains
            modalContent.style.background = 'transparent';
            modalContent.style.boxShadow = 'none';
            modalContent.style.border = 'none';

            // 4. Trigger the Button Move
            finalSubmitBtn.classList.add('btn-animating');
            
            requestAnimationFrame(() => {
                finalSubmitBtn.style.top = '50%';
                finalSubmitBtn.style.left = '50%';
                finalSubmitBtn.style.transform = 'translate(-50%, -50%)'; 
                finalSubmitBtn.style.width = '60px';  
                finalSubmitBtn.style.height = '60px'; 
            });

            finalSubmitBtn.disabled = true;

            // --- D. DATA UPLOAD ---
            const payMode = document.querySelector('input[name="payMode"]:checked').value;
            const filePromises = [
                getFileData('photoFile'), 
                getFileData('docFile'), 
                (payMode === 'Online') ? getFileData('payFile') : Promise.resolve({data:"", name:""})
            ];

            Promise.all(filePromises).then(files => {
                const branchValue = document.getElementById('branch-select').value;
                let targetURL = (branchValue === "Arikuchi") ? URL_ARIKUCHI : URL_BAGALS;
                
                var formData = {
                    branch: branchValue,
                    studentName: document.getElementsByName('studentName')[0].value,
                    fatherName: document.getElementsByName('fatherName')[0].value,
                    email: document.getElementById('email-field').value, 
                    contact: document.getElementsByName('contact')[0].value,
                    village: document.getElementsByName('village')[0].value,
                    po: document.getElementsByName('po')[0].value,
                    district: document.getElementsByName('district')[0].value,
                    pin: document.getElementsByName('pin')[0].value,
                    qualification: document.getElementsByName('qualification')[0].value,
                    activity: document.getElementsByName('activity')[0].value,
                    course3m: document.getElementsByName('course3m')[0].value,
                    course6m: document.getElementsByName('course6m')[0].value,
                    course1y: document.getElementsByName('course1y')[0].value,
                    courseSp: document.getElementsByName('courseSp')[0].value,
                    notes: document.getElementsByName('notes')[0].value, 
                    paymentMode: payMode, 
                    photoData: files[0].data, photoName: files[0].name,
                    docData: files[1].data, docName: files[1].name,
                    payData: files[2].data, payName: files[2].name
                };

                const serialDisplay = document.getElementById('serial-display');
                if(serialDisplay) serialDisplay.innerHTML = 'Generating...';

                const preventLeave = (e) => { e.preventDefault(); e.returnValue = ''; };
                window.addEventListener('beforeunload', preventLeave);

                const uploadPromise = fetch(targetURL, {
                    method: 'POST', body: JSON.stringify(formData)
                }).then(response => response.json());

                // Timer
                const timerPromise = new Promise(resolve => setTimeout(resolve, 2500));

                Promise.all([uploadPromise, timerPromise])
                .then(([data, timerResult]) => {
                    window.removeEventListener('beforeunload', preventLeave);
                    
                    if(data.status === 'success') {
                        // --- E. SUCCESS ANIMATION ---
                        document.getElementById('final-spinner').style.display = 'none';
                        const checkIcon = document.getElementById('btn-check');
                        if(checkIcon) {
                            checkIcon.classList.remove('hidden-check');
                            checkIcon.classList.add('checkmark-show');
                        }
                        finalSubmitBtn.classList.add('btn-success-state');

                        setTimeout(() => {
                            previewModal.classList.add('hidden'); 
                            document.querySelector('.main-wrapper').classList.remove('page-fade-out'); 
                            document.querySelector('.bg-pattern').style.opacity = '0.6';

                            document.getElementById('form-section').classList.add('hidden');
                            document.getElementById('success-view').classList.remove('hidden');
                            if(serialDisplay) serialDisplay.textContent = data.serial;
                        }, 1200);

                    } else {
                        alert("Submission Failed: " + data.message);
                        location.reload(); 
                    }
                })
                .catch(error => {
                    window.removeEventListener('beforeunload', preventLeave);
                    alert("Network Error: " + error);
                    location.reload();
                });
            });
          });
      }


      function handleError(msg) {
        alert(msg);
        document.getElementById('success-view').classList.add('hidden');
        document.getElementById('form-section').classList.remove('hidden');
        var btn = document.getElementById('submit-btn');
        if(btn) {
            btn.disabled = false; 
            btn.classList.remove('loading');
            btn.classList.remove('success'); 
        }
      }

      function getFileData(id) {
        return new Promise(resolve => {
            var el = document.getElementById(id);
            if(!el || !el.files[0]) resolve({data:null, name:null});
            else {
                var file = el.files[0];
                var reader = new FileReader();
                reader.onload = e => resolve({data:e.target.result, name:file.name});
                reader.readAsDataURL(file);
            }
        });
      }

// --- IMPROVED INTERACTIVE FIELD COLOR LOGIC ---
document.addEventListener("DOMContentLoaded", function() {
    // Select all inputs, textareas, AND select dropdowns
    const inputs = document.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input[type='number'], textarea, select");

    inputs.forEach(input => {
        
        // 1. HELPER FUNCTION: Updates color based on value
        const updateColor = () => {
             if (input.value.trim() !== "") {
                input.classList.add("filled-input"); 
            } else {
                input.classList.remove("filled-input"); 
            }
        };

        // 2. WHEN USER LEAVES THE FIELD (BLUR) -> Standard for text boxes
        input.addEventListener("blur", updateColor);

        // 3. WHEN USER SELECTS AN OPTION (CHANGE) -> Specific fix for Dropdowns
        if(input.tagName === "SELECT") {
            input.addEventListener("change", updateColor);
        }

        // 4. WHEN USER CLICKS BACK INTO THE FIELD (FOCUS) -> Turn normal for editing
        input.addEventListener("focus", function() {
            this.classList.remove("filled-input"); 
        });
    });
});


// --- DISABLE RIGHT-CLICK & INSPECT SHORTCUTS ---
document.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Disables right-click menu
});

document.addEventListener('keydown', function(event) {
    // Disable F12
    if (event.key === "F12") {
        event.preventDefault();
    }
    
    // Disable Ctrl+Shift+I (Inspect)
    if (event.ctrlKey && event.shiftKey && event.key === "I") {
        event.preventDefault();
    }

    // Disable Ctrl+Shift+J (Console)
    if (event.ctrlKey && event.shiftKey && event.key === "J") {
        event.preventDefault();
    }

    // Disable Ctrl+U (View Source)
    if (event.ctrlKey && event.key === "u") {
        event.preventDefault();
    }
});
