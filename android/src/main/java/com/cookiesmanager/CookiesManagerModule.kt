package com.cookiesmanager

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import android.webkit.CookieManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments          // ✅ Para createArray() y createMap()
import com.facebook.react.bridge.WritableArray     // ✅ Para el tipo de cookies
import com.facebook.react.bridge.WritableMap
import java.net.URL

@ReactModule(name = CookiesManagerModule.NAME)
class CookiesManagerModule(reactContext: ReactApplicationContext) :
  NativeCookiesManagerSpec(reactContext) {
  private val cookieManager = CookieManager.getInstance()

  override fun getName(): String {
    return NAME
  }

  override fun getCookies(url: String, promise: Promise) {
    try {
        val cookieString = cookieManager.getCookie(url)
        val cookies = Arguments.createArray()

        if (!cookieString.isNullOrEmpty()) {
            cookieString.split(";").forEach { cookie ->
                val trimmedCookie = cookie.trim()
                if (trimmedCookie.isNotEmpty()) {
                    val parts = trimmedCookie.split("=", limit = 2)
                    if (parts.size == 2) {
                        val cookieMap = Arguments.createMap()
                        cookieMap.putString("name", parts[0].trim())
                        cookieMap.putString("value", parts[1].trim())

                        // Extraer dominio de la URL
                        try {
                            val urlObj = URL(url)
                            cookieMap.putString("domain", urlObj.host)
                        } catch (e: Exception) {
                            cookieMap.putString("domain", "")
                        }

                        cookies.pushMap(cookieMap)
                    }
                }
            }
        }

        promise.resolve(cookies)
    } catch (e: Exception) {
        promise.reject("GET_COOKIES_ERROR", "Error getting cookies: ${e.message}", e)
    }
  }

  override fun setCookie(
    url: String,
    name: String,
    value: String,
    domain: String?,
    path: String?,
    expires: Double?,
    secure: Boolean?,
    httpOnly: Boolean?,
    promise: Promise
  ) {
    try {
        val cookieBuilder = StringBuilder("$name=$value")

        domain?.let { cookieBuilder.append("; Domain=$it") }
        path?.let { cookieBuilder.append("; Path=$it") }

        //Convertir timestamp a fecha RFC
        expires?.let {
            val date = java.util.Date(it.toLong())
            val formatter = java.text.SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", java.util.Locale.US)
            formatter.timeZone = java.util.TimeZone.getTimeZone("GMT")
            cookieBuilder.append("; Expires=${formatter.format(date)}")
        }

        if (secure == true ) cookieBuilder.append("; Secure")
        if (httpOnly == true) cookieBuilder.append("; HttpOnly")

        val cookieString = cookieBuilder.toString()

        // Usar callback para verificar éxito
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setCookie(url, cookieString) { success ->
                promise.resolve(success)
            }
        } else {
            // Android legacy
            cookieManager.setCookie(url, cookieString)
            promise.resolve(true)
        }
    } catch (e: Exception) {
        promise.reject("SET_COOKIE_ERROR", "Error setting cookie: ${e.message}", e)
    }
  }

  override fun removeCookie(url: String, name: String, promise: Promise) {
    try {
      val pastDate = "Thu, 01 Jan 1970 00:00:00 GMT"
      cookieManager.setCookie(url, "$name=; Expires=$pastDate; Max-Age=0; Path=/")
      cookieManager.flush()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("REMOVE_COOKIE_ERROR", "Error removing cookie: ${e.message}", e)
    }
  }

  override fun clearCookies(promise: Promise) {
    try {
      cookieManager.removeAllCookies { success ->
        // Este callback se ejecuta cuando termina la operación
        promise.resolve(success)
      }
    } catch (e: Exception) {
      promise.reject("CLEAR_COOKIES_ERROR", "Error clearing cookies: ${e.message}", e)
    }
  }

  override fun flush(promise: Promise) {
    try {
      cookieManager.flush()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("FLUSH_ERROR", "Error flushing cookies: ${e.message}", e)
    }
  }

  companion object {
    const val NAME = "CookiesManager"
  }
}

// data class Cookie(
//     val name: String,
//     val value: String,
//     val domain: String? = null,
//     val path: String? = null,
//     val expires: Double? = null,
//     val secure: Boolean = false,
//     val httpOnly: Boolean = false
// )
