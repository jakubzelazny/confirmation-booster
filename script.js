import { testAddSuccessListener } from "./testScripts.js"

window._confirmationBoosterData = {}

window._confirmationBoosterData.emailSubmitted = false
window._confirmationBoosterData.subscriberEmailAddress = null
window._confirmationBoosterData.emailInputSelector =
  window._confirmationBoosterSettings.emailInputSelector
window._confirmationBoosterData.submitButtonSelector =
  window._confirmationBoosterSettings.submitButtonSelector
window._confirmationBoosterData.successElementSelector =
  window._confirmationBoosterSettings.successElementSelector
window._confirmationBoosterData.senderEmailAddress = "jonathanstark.com"

const emailProviders = [
  {
    name: "Gmail",
    domains: ["gmail.com"],
    mxRecordsSubstrings: ["google.com"],
    iconPath: "./icons/gmail.png",
    url: () => {
      return `https://mail.google.com/mail/u/${window._confirmationBoosterData.subscriberEmailAddress}/#search/from:${window._confirmationBoosterData.senderEmailAddress}+in:anywhere+newer_than:1d`
    },
  },
  {
    name: "Outlook",
    domains: ["outlook.com", "hotmail.com", "live.com"],
    mxRecordsSubstrings: ["outlook.com"],
    url: () => {
      return "https://outlook.live.com"
    },
  },
]

function generateButton(options) {
  return `
    <a href="${options.url}" target="_blank"
    style="display: flex; align-items: center; border-radius: 8px; border: #6b7280 1px solid; padding: 8px 32px; font-size: 16px; font-weight: 600; text-decoration: none; color: #111827;">
    <img src="${options.iconPath}" height="20" style="height: 20px;" />
    <div style="margin: 0 0 0 8px; ">Open ${options.name}</div>
  </a>
  `
}

const buttonsHTML = (options) => {
  let finalHTML = ""
  if (options.provider) {
    finalHTML += generateButton({
      url: options.provider.url(),
      name: options.provider.name,
      iconPath: options.provider.iconPath,
    })
  }

  if (options.platform === "macos" || options.platform === "ios") {
    finalHTML += generateButton({
      url: "message://",
      name: "Apple Mail",
      iconPath: "./icons/apple.png",
    })
  }

  return finalHTML
}

async function checkEmailProvider(email) {
  const domain = email.split("@")[1]
  let provider = emailProviders.find((provider) => {
    return provider.domains.includes(domain)
  })

  if (!provider) {
    const mxRecords = await fetchMXRecords(domain)
    if (mxRecords == null) {
      return null
    }
    provider = emailProviders.find((provider) => {
      return mxRecords.some((record) => {
        return provider.mxRecordsSubstrings.some((substring) => {
          return record.data.includes(substring)
        })
      })
    })
  }

  return provider
}

async function fetchMXRecords(domain) {
  let response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`,
    { headers: { accept: "application/dns-json" } }
  )

  const data = await response.json()

  return data.Answer
}

function getPlatform() {
  const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i
  const windowsPlatforms = /(win32|win64|windows|wince)/i
  const iosPlatforms = /(iphone|ipad|ipod)/i
  const linuxPlatforms = /(linux)/i
  const androidPlatforms = /(android)/i

  const platformName = navigator.platform.toLowerCase()

  if (macosPlatforms.test(platformName)) {
    return "macos"
  } else if (iosPlatforms.test(platformName)) {
    return "ios"
  } else if (windowsPlatforms.test(platformName)) {
    return "windows"
  } else if (linuxPlatforms.test(platformName)) {
    return "linux"
  } else if (androidPlatforms.test(platformName)) {
    return "android"
  }
}

function watchForSuccess() {
  const observer = new MutationObserver((records, observer) => {
    if (
      window._confirmationBoosterData.emailSubmitted &&
      document.querySelector(
        window._confirmationBoosterData.successElementSelector
      )
    ) {
      console.log("FOUND Success element in observer")

      mainSomething()
      observer.disconnect()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return null
}

function watchEmailInput() {
  const emailInput = document.querySelector(
    window._confirmationBoosterData.emailInputSelector
  )

  if (emailInput) {
    window._confirmationBoosterData.emailInput = emailInput
    console.log("FOUND email input OUTSIDE observer")
  } else {
    const observer = new MutationObserver((records, observer) => {
      if (
        !window._confirmationBoosterData.emailSubmitted &&
        document.querySelector(
          window._confirmationBoosterData.emailInputSelector
        )
      ) {
        console.log("FOUND email input in observer")

        window._confirmationBoosterData.emailInput = document.querySelector(
          window._confirmationBoosterData.emailInputSelector
        )

        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  return null
}

function watchNewsletterSubmitButton() {
  const submitButton = document.querySelector(
    window._confirmationBoosterData.submitButtonSelector
  )

  if (submitButton) {
    console.log("FOUND submit button OUTSIDE observer")
    window._confirmationBoosterData.submitButton = submitButton
    window._confirmationBoosterData.submitButton.addEventListener(
      "click",
      submitButtonCallback
    )
  } else {
    const observer = new MutationObserver((records, observer) => {
      if (
        document.querySelector(
          window._confirmationBoosterData.submitButtonSelector
        )
      ) {
        console.log("FOUND submit button INSIDE observer")

        window._confirmationBoosterData.submitButton = document.querySelector(
          window._confirmationBoosterData.submitButtonSelector
        )
        window._confirmationBoosterData.submitButton.addEventListener(
          "click",
          submitButtonCallback
        )

        observer.disconnect()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }
  return null
}

function mainSomething() {
  checkEmailProvider(
    window._confirmationBoosterData.subscriberEmailAddress
  ).then((provider) => {
    document.getElementById("output").innerHTML = buttonsHTML({
      provider: provider,
      platform: getPlatform(),
    })
  })
}

function submitButtonCallback() {
  const email = window._confirmationBoosterData.emailInput.value
  window._confirmationBoosterData.emailSubmitted = true
  window._confirmationBoosterData.subscriberEmailAddress = email
}

watchEmailInput()
watchNewsletterSubmitButton()
watchForSuccess()
testAddSuccessListener()

window.checkEmailProvider = checkEmailProvider
window.fetchMXRecords = fetchMXRecords
window.getPlatform = getPlatform
