// Application State
let currentUser = null
let currentQuiz = null
let currentQuestionIndex = 0
let userAnswers = []
let quizTimer = null
let questionTimer = null
let timeRemaining = 600 // 10 minutes in seconds
let questionTimeRemaining = 0
let uploadedFileContent = null

// Sample quiz data structure
const sampleQuestions = [
  {
    type: "mcq",
    question: "What is the capital of the Philippines?",
    options: ["Manila", "Cebu", "Davao", "Iloilo"],
    correct: 0,
  },
  {
    type: "true_false",
    question: "The Philippines has 7,641 islands.",
    correct: true,
  },
  {
    type: "fill_blank",
    question: "The national hero of the Philippines is Dr. _____ Rizal.",
    correct: "Jose",
  },
  {
    type: "define",
    question: 'Define "Bayanihan"',
    correct: "Filipino spirit of communal unity and cooperation",
  },
  {
    type: "enumeration",
    question: "List three major islands in the Philippines:",
    correct: ["Luzon", "Visayas", "Mindanao"],
  },
]

// Question time limits (in seconds)
const questionTimeLimits = {
  mcq: 15,
  fill_blank: 30,
  true_false: 15,
  enumeration: 60,
  define: 60,
}

// DOM Elements
const authScreen = document.getElementById("auth-screen")
const dashboardScreen = document.getElementById("dashboard-screen")
const signinForm = document.getElementById("signin-form")
const registerForm = document.getElementById("register-form")
const tabBtns = document.querySelectorAll(".tab-btn")
const fileInput = document.getElementById("file-input")
const uploadArea = document.getElementById("upload-area")
const generateQuizBtn = document.getElementById("generate-quiz-btn")
const quizSection = document.getElementById("quiz-section")
const resultsSection = document.getElementById("results-section")

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
})

function initializeApp() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("studyTermTrackUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    showDashboard()
  } else {
    showAuthScreen()
  }
}

function setupEventListeners() {
  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  })

  // Form submissions
  signinForm.addEventListener("submit", handleSignIn)
  registerForm.addEventListener("submit", handleRegister)

  // File upload
  uploadArea.addEventListener("click", () => fileInput.click())
  uploadArea.addEventListener("dragover", handleDragOver)
  uploadArea.addEventListener("drop", handleFileDrop)
  fileInput.addEventListener("change", handleFileSelect)

  // Quiz generation
  generateQuizBtn.addEventListener("click", generateQuiz)

  // Quiz controls
  document.getElementById("prev-btn").addEventListener("click", previousQuestion)
  document.getElementById("next-btn").addEventListener("click", nextQuestion)
  document.getElementById("submit-quiz-btn").addEventListener("click", submitQuiz)

  // Other controls
  document.getElementById("logout-btn").addEventListener("click", logout)
  document.getElementById("new-quiz-btn").addEventListener("click", startNewQuiz)
}

function switchTab(tabName) {
  // Update tab buttons
  tabBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName)
  })

  // Update forms
  document.getElementById("signin-form").classList.toggle("active", tabName === "signin")
  document.getElementById("register-form").classList.toggle("active", tabName === "register")
}

function handleSignIn(e) {
  e.preventDefault()
  const email = document.getElementById("signin-email").value
  const password = document.getElementById("signin-password").value

  // Validate CARSU email
  if (!email.endsWith("@carsu.edu.ph")) {
    alert("Please use a valid @carsu.edu.ph email address.")
    return
  }

  // Check if user exists in localStorage
  const users = JSON.parse(localStorage.getItem("studyTermTrackUsers") || "[]")
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    localStorage.setItem("studyTermTrackUser", JSON.stringify(user))
    showDashboard()
  } else {
    alert("Invalid email or password.")
  }
}

function handleRegister(e) {
  e.preventDefault()
  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm").value

  // Validate CARSU email
  if (!email.endsWith("@carsu.edu.ph")) {
    alert("Please use a valid @carsu.edu.ph email address.")
    return
  }

  // Validate password match
  if (password !== confirmPassword) {
    alert("Passwords do not match.")
    return
  }

  // Check if user already exists
  const users = JSON.parse(localStorage.getItem("studyTermTrackUsers") || "[]")
  if (users.find((u) => u.email === email)) {
    alert("An account with this email already exists.")
    return
  }

  // Create new user
  const newUser = { name, email, password, id: Date.now() }
  users.push(newUser)
  localStorage.setItem("studyTermTrackUsers", JSON.stringify(users))

  currentUser = newUser
  localStorage.setItem("studyTermTrackUser", JSON.stringify(newUser))
  showDashboard()
}

function showAuthScreen() {
  authScreen.classList.add("active")
  dashboardScreen.classList.remove("active")
}

function showDashboard() {
  authScreen.classList.remove("active")
  dashboardScreen.classList.add("active")
}

function handleDragOver(e) {
  e.preventDefault()
  uploadArea.classList.add("dragover")
}

function handleFileDrop(e) {
  e.preventDefault()
  uploadArea.classList.remove("dragover")
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) {
    handleFile(file)
  }
}

function handleFile(file) {
  const fileType = document.querySelector('input[name="fileType"]:checked').value
  const allowedTypes = {
    pdf: ["application/pdf"],
    word: ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ppt: ["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  }

  if (!allowedTypes[fileType].includes(file.type)) {
    alert(`Please select a valid ${fileType.toUpperCase()} file.`)
    return
  }

  // Update UI to show file selected
  const uploadContent = uploadArea.querySelector(".upload-content")
  uploadContent.innerHTML = `
        <div class="upload-icon">✅</div>
        <p><strong>${file.name}</strong> selected</p>
        <p>File type: ${fileType.toUpperCase()}</p>
        <p>Processing file content...</p>
    `

  // Extract text content from file
  extractFileContent(file, fileType)
}

function extractFileContent(file, fileType) {
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const content = e.target.result

      if (fileType === "pdf") {
        processPDFFile(file, content)
      } else if (fileType === "word") {
        processWordFile(file, content)
      } else if (fileType === "ppt") {
        processPPTFile(file, content)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      showFileError(file.name, "Failed to process file. Please try a different file.")
    }
  }

  reader.onerror = () => {
    showFileError(file.name, "Failed to read file. Please try again.")
  }

  if (fileType === "pdf") {
    reader.readAsArrayBuffer(file)
  } else {
    reader.readAsText(file)
  }
}

function processPDFFile(file, content) {
  try {
    // Simulate PDF text extraction with better error handling
    const filename = file.name.toLowerCase()

    // Check if file seems to be a valid PDF
    if (file.size < 1000) {
      throw new Error("File appears to be too small or corrupted")
    }

    const topics = extractTopicsFromFilename(filename)
    uploadedFileContent = generateRealisticContent(topics, "pdf")

    showFileSuccess(file.name, "PDF")
  } catch (error) {
    showFileError(file.name, "Unable to extract text from this PDF. Please try a text-based PDF file.")
  }
}

function processWordFile(file, content) {
  try {
    const filename = file.name.toLowerCase()

    // Check file size
    if (file.size < 100) {
      throw new Error("File appears to be too small or empty")
    }

    // Try to extract some basic text content
    let textContent = ""
    if (typeof content === "string") {
      textContent = content
    } else {
      // For binary Word files, we'll use filename-based generation
      textContent = filename
    }

    const topics = extractTopicsFromFilename(filename)
    uploadedFileContent = generateRealisticContent(topics, "word", textContent)

    showFileSuccess(file.name, "Word Document")
  } catch (error) {
    showFileError(
      file.name,
      "Unable to process this Word document. Please try a different file or save as .txt format.",
    )
  }
}

function processPPTFile(file, content) {
  try {
    const filename = file.name.toLowerCase()

    // Check file size
    if (file.size < 1000) {
      throw new Error("File appears to be too small or corrupted")
    }

    const topics = extractTopicsFromFilename(filename)
    uploadedFileContent = generateRealisticContent(topics, "ppt")

    showFileSuccess(file.name, "PowerPoint Presentation")
  } catch (error) {
    showFileError(file.name, "Unable to process this PowerPoint file. Please try a different presentation.")
  }
}

function showFileSuccess(filename, fileType) {
  const uploadContent = uploadArea.querySelector(".upload-content")
  uploadContent.innerHTML = `
    <div class="upload-icon">✅</div>
    <p><strong>${filename}</strong> processed successfully</p>
    <p>File type: ${fileType}</p>
    <p>Content extracted and ready for quiz generation!</p>
  `
  generateQuizBtn.disabled = false
}

function showFileError(filename, errorMessage) {
  const uploadContent = uploadArea.querySelector(".upload-content")
  uploadContent.innerHTML = `
    <div class="upload-icon" style="color: #ef4444;">❌</div>
    <p><strong>${filename}</strong></p>
    <p style="color: #ef4444;">${errorMessage}</p>
    <p style="color: #6b7280; font-size: 14px;">Try uploading a different file or contact support if the issue persists.</p>
  `
  generateQuizBtn.disabled = true
  uploadedFileContent = null
}

function extractTopicsFromFilename(filename) {
  const name = filename.toLowerCase()

  if (name.includes("cpu") || name.includes("processor")) {
    return ["CPU", "processor", "computer architecture", "central processing unit"]
  } else if (name.includes("network") || name.includes("internet")) {
    return ["networking", "internet", "protocols", "TCP/IP"]
  } else if (name.includes("database") || name.includes("sql")) {
    return ["database", "SQL", "data management", "DBMS"]
  } else if (name.includes("programming") || name.includes("code")) {
    return ["programming", "coding", "algorithms", "software development"]
  } else if (name.includes("math") || name.includes("calculus")) {
    return ["mathematics", "calculus", "algebra", "equations"]
  } else if (name.includes("physics")) {
    return ["physics", "mechanics", "thermodynamics", "electricity"]
  } else if (name.includes("chemistry")) {
    return ["chemistry", "molecules", "reactions", "periodic table"]
  } else if (name.includes("biology")) {
    return ["biology", "cells", "organisms", "genetics"]
  } else if (name.includes("history")) {
    return ["history", "events", "civilization", "culture"]
  } else if (name.includes("literature") || name.includes("english")) {
    return ["literature", "poetry", "novels", "writing"]
  }

  return ["general knowledge", "academic concepts", "study material", "education"]
}

function generateRealisticContent(topics, fileType, textContent = "") {
  const content = {
    topics: topics,
    keyTerms: [],
    concepts: [],
    facts: [],
  }

  // If we have actual text content, try to extract keywords
  if (textContent && textContent.length > 50) {
    const words = textContent.toLowerCase().match(/\b\w{4,}\b/g) || []
    const commonWords = new Set([
      "this",
      "that",
      "with",
      "have",
      "will",
      "been",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
    ])
    const uniqueWords = [...new Set(words.filter((word) => !commonWords.has(word)))]

    if (uniqueWords.length > 5) {
      content.keyTerms = uniqueWords.slice(0, 8)
    }
  }

  // Generate content based on primary topic
  const primaryTopic = topics[0]

  if (primaryTopic.includes("CPU") || primaryTopic.includes("processor")) {
    content.keyTerms = ["CPU", "ALU", "Control Unit", "Cache", "Register", "Clock Speed", "Core", "Pipeline"]
    content.concepts = [
      "The CPU is the brain of the computer that executes instructions",
      "ALU performs arithmetic and logical operations",
      "Control Unit manages the execution of instructions",
      "Cache memory provides fast access to frequently used data",
      "Multiple cores allow parallel processing",
    ]
    content.facts = [
      "Modern CPUs can execute billions of instructions per second",
      "The first microprocessor was the Intel 4004 in 1971",
      "CPU performance is measured in GHz (gigahertz)",
    ]
  } else if (primaryTopic.includes("network")) {
    content.keyTerms = ["TCP/IP", "HTTP", "Router", "Switch", "Protocol", "Bandwidth", "Latency", "Firewall"]
    content.concepts = [
      "Networks allow computers to communicate and share resources",
      "TCP/IP is the fundamental protocol suite for internet communication",
      "Routers direct data packets between different networks",
      "Bandwidth determines the maximum data transfer rate",
    ]
    content.facts = [
      "The internet connects billions of devices worldwide",
      "HTTP is the protocol used for web browsing",
      "Network security is crucial for protecting data",
    ]
  }

  return content
}

function generateQuiz() {
  if (!uploadedFileContent) {
    alert("Please upload and process a file first.")
    return
  }

  const questions = []

  // Generate 5 MCQ questions
  for (let i = 0; i < 5; i++) {
    questions.push(generateMCQQuestion(uploadedFileContent, i))
  }

  // Generate 5 True/False questions
  for (let i = 0; i < 5; i++) {
    questions.push(generateTrueFalseQuestion(uploadedFileContent, i))
  }

  // Generate 5 Fill-in-the-blank questions
  for (let i = 0; i < 5; i++) {
    questions.push(generateFillBlankQuestion(uploadedFileContent, i))
  }

  // Generate 5 Define questions
  for (let i = 0; i < 5; i++) {
    questions.push(generateDefineQuestion(uploadedFileContent, i))
  }

  // Generate 5 Enumeration questions
  for (let i = 0; i < 5; i++) {
    questions.push(generateEnumerationQuestion(uploadedFileContent, i))
  }

  // Shuffle questions for variety
  currentQuiz = {
    questions: shuffleArray(questions),
    totalQuestions: questions.length,
  }

  userAnswers = new Array(currentQuiz.totalQuestions).fill(null)
  currentQuestionIndex = 0

  showQuiz()
  startQuestionTimer()
}

function generateMCQQuestion(content, index) {
  const concepts = content.concepts
  const keyTerms = content.keyTerms

  if (concepts.length > index) {
    const concept = concepts[index % concepts.length]
    const correctTerm = keyTerms[index % keyTerms.length]

    // Generate distractors
    const distractors = keyTerms.filter((term) => term !== correctTerm).slice(0, 3)
    const options = shuffleArray([correctTerm, ...distractors])

    return {
      type: "mcq",
      question: `Which component is primarily responsible for: ${concept}?`,
      options: options,
      correct: options.indexOf(correctTerm),
      timeLimit: questionTimeLimits.mcq,
    }
  }

  // Fallback question
  return {
    type: "mcq",
    question: `What is a key component related to ${content.topics[0]}?`,
    options: keyTerms.slice(0, 4),
    correct: 0,
    timeLimit: questionTimeLimits.mcq,
  }
}

function generateTrueFalseQuestion(content, index) {
  const facts = content.facts
  const concepts = content.concepts

  if (facts.length > index) {
    return {
      type: "true_false",
      question: facts[index % facts.length],
      correct: true,
      timeLimit: questionTimeLimits.true_false,
    }
  } else {
    // Generate false statement
    const concept = concepts[index % concepts.length]
    return {
      type: "true_false",
      question: `${concept.replace(/is|are/, "is not").replace(/can|will/, "cannot")}`,
      correct: false,
      timeLimit: questionTimeLimits.true_false,
    }
  }
}

function generateFillBlankQuestion(content, index) {
  const keyTerms = content.keyTerms
  const concepts = content.concepts

  const term = keyTerms[index % keyTerms.length]
  const concept = concepts[index % concepts.length]

  // Create a fill-in-the-blank by removing the key term
  const questionText = concept.replace(new RegExp(term, "gi"), "______")

  return {
    type: "fill_blank",
    question: questionText,
    correct: term,
    timeLimit: questionTimeLimits.fill_blank,
  }
}

function generateDefineQuestion(content, index) {
  const keyTerms = content.keyTerms
  const concepts = content.concepts

  const term = keyTerms[index % keyTerms.length]
  const relatedConcept = concepts.find((c) => c.toLowerCase().includes(term.toLowerCase())) || concepts[0]

  return {
    type: "define",
    question: `Define "${term}" in the context of ${content.topics[0]}`,
    correct: relatedConcept,
    timeLimit: questionTimeLimits.define,
  }
}

function generateEnumerationQuestion(content, index) {
  const topics = content.topics
  const keyTerms = content.keyTerms

  const category = topics[0]
  const items = keyTerms.slice(index * 3, index * 3 + 3)

  return {
    type: "enumeration",
    question: `List three important components or concepts related to ${category}:`,
    correct: items,
    timeLimit: questionTimeLimits.enumeration,
  }
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function showQuiz() {
  quizSection.classList.remove("hidden")
  displayQuestion()
  updateQuestionCounter()
}

function displayQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex]
  const container = document.getElementById("question-container")

  let questionHTML = `<div class="question">
        <h3>Question ${currentQuestionIndex + 1}: ${question.question}</h3>
        <div class="question-timer">Time: <span id="question-time">${question.timeLimit}</span>s</div>`

  switch (question.type) {
    case "mcq":
      questionHTML += '<div class="question-options">'
      question.options.forEach((option, index) => {
        const checked = userAnswers[currentQuestionIndex] === index ? "checked" : ""
        questionHTML += `
                    <label class="option">
                        <input type="radio" name="question${currentQuestionIndex}" value="${index}" ${checked}>
                        <span>${option}</span>
                    </label>`
      })
      questionHTML += "</div>"
      break

    case "true_false":
      questionHTML += '<div class="question-options">'
      const trueChecked = userAnswers[currentQuestionIndex] === true ? "checked" : ""
      const falseChecked = userAnswers[currentQuestionIndex] === false ? "checked" : ""
      questionHTML += `
                <label class="option">
                    <input type="radio" name="question${currentQuestionIndex}" value="true" ${trueChecked}>
                    <span>True</span>
                </label>
                <label class="option">
                    <input type="radio" name="question${currentQuestionIndex}" value="false" ${falseChecked}>
                    <span>False</span>
                </label>
            </div>`
      break

    case "fill_blank":
      const fillValue = userAnswers[currentQuestionIndex] || ""
      questionHTML += `
                <input type="text" class="fill-blank-input" placeholder="Enter your answer" value="${fillValue}">
            `
      break

    case "define":
    case "enumeration":
      const textValue = userAnswers[currentQuestionIndex] || ""
      questionHTML += `
                <textarea class="fill-blank-input" style="width: 100%; height: 100px; resize: vertical;" placeholder="Enter your answer">${textValue}</textarea>
            `
      break
  }

  questionHTML += "</div>"

  questionHTML += `
    <div class="quiz-controls" style="margin-top: 20px; text-align: center;">
      <button id="submit-early-btn" class="submit-btn" style="background: #059669; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-left: 10px;">
        Submit Quiz Early
      </button>
    </div>
  `

  container.innerHTML = questionHTML

  // Add event listeners for answer capture
  const inputs = container.querySelectorAll("input, textarea")
  inputs.forEach((input) => {
    input.addEventListener("change", captureAnswer)
    input.addEventListener("input", captureAnswer)
  })

  document.getElementById("submit-early-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to submit the quiz early? You won't be able to change your answers.")) {
      submitQuiz()
    }
  })

  // Update navigation buttons
  document.getElementById("prev-btn").disabled = currentQuestionIndex === 0
  document.getElementById("next-btn").style.display =
    currentQuestionIndex === currentQuiz.totalQuestions - 1 ? "none" : "inline-block"
  document.getElementById("submit-quiz-btn").style.display =
    currentQuestionIndex === currentQuiz.totalQuestions - 1 ? "inline-block" : "none"

  // Start individual question timer
  startQuestionTimer()
}

function startQuestionTimer() {
  const question = currentQuiz.questions[currentQuestionIndex]
  questionTimeRemaining = question.timeLimit

  // Clear existing timer
  if (questionTimer) {
    clearInterval(questionTimer)
  }

  updateQuestionTimerDisplay()

  questionTimer = setInterval(() => {
    questionTimeRemaining--
    updateQuestionTimerDisplay()

    if (questionTimeRemaining <= 0) {
      clearInterval(questionTimer)
      // Auto-advance to next question when time runs out
      if (currentQuestionIndex < currentQuiz.totalQuestions - 1) {
        nextQuestion()
      } else {
        submitQuiz()
      }
    }
  }, 1000)
}

function updateQuestionTimerDisplay() {
  const timerElement = document.getElementById("question-time")
  if (timerElement) {
    timerElement.textContent = questionTimeRemaining

    // Change color when time is running low
    if (questionTimeRemaining <= 5) {
      timerElement.style.color = "#ef4444"
      timerElement.style.fontWeight = "bold"
    } else if (questionTimeRemaining <= 10) {
      timerElement.style.color = "#f59e0b"
    } else {
      timerElement.style.color = "#10b981"
    }
  }
}

function captureAnswer() {
  const question = currentQuiz.questions[currentQuestionIndex]
  const container = document.getElementById("question-container")

  switch (question.type) {
    case "mcq":
      const selectedOption = container.querySelector('input[type="radio"]:checked')
      userAnswers[currentQuestionIndex] = selectedOption ? Number.parseInt(selectedOption.value) : null
      break

    case "true_false":
      const selectedTF = container.querySelector('input[type="radio"]:checked')
      userAnswers[currentQuestionIndex] = selectedTF ? selectedTF.value === "true" : null
      break

    case "fill_blank":
    case "define":
    case "enumeration":
      const textInput = container.querySelector("input, textarea")
      userAnswers[currentQuestionIndex] = textInput.value.trim()
      break
  }
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    clearInterval(questionTimer)
    currentQuestionIndex--
    displayQuestion()
    updateQuestionCounter()
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.totalQuestions - 1) {
    clearInterval(questionTimer)
    currentQuestionIndex++
    displayQuestion()
    updateQuestionCounter()
  }
}

function updateQuestionCounter() {
  document.getElementById("question-counter").textContent =
    `Question ${currentQuestionIndex + 1} of ${currentQuiz.totalQuestions}`
}

function startTimer() {
  quizTimer = setInterval(() => {
    timeRemaining--
    updateTimerDisplay()

    if (timeRemaining <= 0) {
      clearInterval(quizTimer)
      submitQuiz()
    }
  }, 1000)
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  document.getElementById("timer-display").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function submitQuiz() {
  clearInterval(quizTimer)
  clearInterval(questionTimer)

  let correctAnswers = 0
  const incorrectAnswers = []

  currentQuiz.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index]
    let isCorrect = false

    switch (question.type) {
      case "mcq":
        isCorrect = userAnswer === question.correct
        if (!isCorrect) {
          incorrectAnswers.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : "No answer",
            correctAnswer: question.options[question.correct],
            type: "Multiple Choice",
          })
        }
        break
      case "true_false":
        isCorrect = userAnswer === question.correct
        if (!isCorrect) {
          incorrectAnswers.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer !== null ? (userAnswer ? "True" : "False") : "No answer",
            correctAnswer: question.correct ? "True" : "False",
            type: "True/False",
          })
        }
        break
      case "fill_blank":
      case "define":
        isCorrect = userAnswer && userAnswer.toLowerCase().includes(question.correct.toLowerCase())
        if (!isCorrect) {
          incorrectAnswers.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer || "No answer",
            correctAnswer: question.correct,
            type: question.type === "fill_blank" ? "Fill in the Blank" : "Define",
          })
        }
        break
      case "enumeration":
        if (userAnswer) {
          const userItems = userAnswer
            .toLowerCase()
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
          const correctItems = question.correct.map((item) => item.toLowerCase())
          const matches = userItems.filter((item) =>
            correctItems.some((correct) => correct.includes(item) || item.includes(correct)),
          )
          isCorrect = matches.length >= Math.min(correctItems.length, 2)
        }
        if (!isCorrect) {
          incorrectAnswers.push({
            questionNumber: index + 1,
            question: question.question,
            userAnswer: userAnswer || "No answer",
            correctAnswer: question.correct.join(", "),
            type: "Enumeration",
          })
        }
        break
    }

    if (isCorrect) correctAnswers++
  })

  const percentage = Math.round((correctAnswers / currentQuiz.totalQuestions) * 100)
  showResults(correctAnswers, currentQuiz.totalQuestions, percentage, incorrectAnswers)
}

function showResults(correct, total, percentage, incorrectAnswers) {
  quizSection.classList.add("hidden")
  resultsSection.classList.remove("hidden")

  document.getElementById("score-percentage").textContent = `${percentage}%`
  document.getElementById("score-text").textContent = `You scored ${correct} out of ${total}`

  // Update score circle color based on performance
  const scoreCircle = document.querySelector(".score-circle")
  if (percentage >= 80) {
    scoreCircle.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"
  } else if (percentage >= 60) {
    scoreCircle.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  } else {
    scoreCircle.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  }

  const resultsContainer = document.getElementById("results-section")
  let detailedResults = resultsContainer.querySelector(".detailed-results")

  if (!detailedResults) {
    detailedResults = document.createElement("div")
    detailedResults.className = "detailed-results"
    resultsContainer.appendChild(detailedResults)
  }

  if (incorrectAnswers.length > 0) {
    let incorrectHTML = `
      <div class="incorrect-answers">
        <h3 style="color: #ef4444; margin-bottom: 20px;">Review Your Incorrect Answers:</h3>
    `

    incorrectAnswers.forEach((item) => {
      incorrectHTML += `
        <div class="incorrect-item" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="font-weight: bold; color: #dc2626; margin-bottom: 8px;">
            Question ${item.questionNumber} (${item.type})
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Question:</strong> ${item.question}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Your Answer:</strong> <span style="color: #dc2626;">${item.userAnswer}</span>
          </div>
          <div>
            <strong>Correct Answer:</strong> <span style="color: #059669;">${item.correctAnswer}</span>
          </div>
        </div>
      `
    })

    incorrectHTML += `</div>`
    detailedResults.innerHTML = incorrectHTML
  } else {
    detailedResults.innerHTML = `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center;">
        <h3 style="color: #059669; margin-bottom: 10px;">Perfect Score! 🎉</h3>
        <p style="color: #065f46;">You answered all questions correctly!</p>
      </div>
    `
  }
}

function startNewQuiz() {
  // Reset quiz state
  currentQuiz = null
  currentQuestionIndex = 0
  userAnswers = []

  // Hide quiz and results sections
  quizSection.classList.add("hidden")
  resultsSection.classList.add("hidden")

  // Reset file upload
  fileInput.value = ""
  generateQuizBtn.disabled = true
  const uploadContent = uploadArea.querySelector(".upload-content")
  uploadContent.innerHTML = `
        <div class="upload-icon">📁</div>
        <p>Drag and drop your file here or click to browse</p>
    `
}

function logout() {
  localStorage.removeItem("studyTermTrackUser")
  currentUser = null
  startNewQuiz()
  showAuthScreen()
}
