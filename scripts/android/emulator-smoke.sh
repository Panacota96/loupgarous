#!/usr/bin/env bash
set -euo pipefail

artifact_dir="${ANDROID_SMOKE_ARTIFACT_DIR:-android/artifacts}"
apk_path="${APK_PATH:-android/app/build/outputs/apk/debug/app-debug.apk}"
package_name="${PACKAGE_NAME:-com.panacota96.loupgarous}"
activity_name="${ACTIVITY_NAME:-com.panacota96.loupgarous/.MainActivity}"

mkdir -p "$artifact_dir"

adb wait-for-device
adb shell settings put global window_animation_scale 0 >/dev/null 2>&1 || true
adb shell settings put global transition_animation_scale 0 >/dev/null 2>&1 || true
adb shell settings put global animator_duration_scale 0 >/dev/null 2>&1 || true

adb install -r "$apk_path"
adb logcat -c
adb shell am force-stop "$package_name" || true
adb shell am start -W -n "$activity_name" | tee "$artifact_dir/start-activity.txt"

sleep 15

(adb shell pidof -s "$package_name" || true) | tee "$artifact_dir/pid.txt"
(adb shell dumpsys window windows | grep -E 'mCurrentFocus|mFocusedApp' || true) | tee "$artifact_dir/focus.txt"
# Capture the app log before running helper tools like uiautomator, which may
# emit their own AndroidRuntime crashes unrelated to the target application.
adb logcat -d > "$artifact_dir/logcat.txt"
adb exec-out uiautomator dump /dev/tty > "$artifact_dir/ui.xml" || true
adb exec-out screencap -p > "$artifact_dir/launch.png" || true

if ! grep -Eq '[0-9]+' "$artifact_dir/pid.txt"; then
  echo "Application process did not stay alive after launch." >&2
  exit 1
fi

if ! grep -q "$package_name" "$artifact_dir/focus.txt" \
  && ! grep -q "$package_name" "$artifact_dir/ui.xml" \
  && ! grep -q "Displayed ${activity_name}" "$artifact_dir/logcat.txt"; then
  echo "Application never became the visible foreground app." >&2
  exit 1
fi

if grep -Eq "ANR in ${package_name}|Process: ${package_name}, PID:|Process ${package_name} .* has died" "$artifact_dir/logcat.txt"; then
  echo "Crash or ANR detected in logcat." >&2
  exit 1
fi
