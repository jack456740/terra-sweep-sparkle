# Execution Evidence Guide - Task 1.3
## How to Capture Screenshots and Test Logs

---

## Step 1: Start the Development Server

### Option A: Using Terminal/Command Prompt

1. **Open Terminal/PowerShell** in your project directory:
   ```bash
   cd C:\Users\nrvs1\OneDrive\Desktop\terra-sweep-sparkle
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **You should see output like:**
   ```
   VITE v5.4.19  ready in 500 ms
   
   ➜  Local:   http://localhost:8080/
   ➜  Network: use --host to expose
   ```

5. **Open your browser** and navigate to: `http://localhost:8080`

### Option B: Using VS Code/Cursor

1. Open the integrated terminal (Ctrl + ` or View → Terminal)
2. Run `npm run dev`
3. Click the localhost link that appears in the terminal

---

## Step 2: Test the Application

### Test Scenario 1: Robot Deployment

**Steps:**
1. Open the dashboard in your browser
2. Look for the "Deploy Robot" button
3. Click the "Deploy Robot" button
4. Observe the changes:
   - Button should show "Deploying..." state
   - After 2 seconds, robot status should change to "Cleaning"
   - Location should change to "Zone A - North Side"
   - Toast notification should appear

**Screenshot to Capture:**
- Screenshot showing robot in "Cleaning" state
- Should show: Status = "Cleaning", Location = "Zone A - North Side"

---

### Test Scenario 2: Battery Depletion and Low Battery Warning

**Steps:**
1. Deploy the robot (if not already deployed)
2. Wait for the battery to deplete (it decreases by 1% every 2 seconds)
3. When battery reaches 20%, observe:
   - Robot status should change to "Returning"
   - Location should show "Returning (Low Battery)"
   - Toast notification: "Low battery! Returning to base..."

**Screenshot to Capture:**
- Screenshot showing battery at or below 20%
- Should show: Status = "Returning", Location = "Returning (Low Battery)"
- Battery indicator should be red/orange

---

### Test Scenario 3: Cleaning Progress Completion

**Steps:**
1. Deploy the robot
2. Wait for cleaning progress to reach 100%
3. Observe:
   - Robot status should change to "Returning"
   - Location should show "Returning..."
   - Toast notification: "Cleaning complete! Returning to base."

**Screenshot to Capture:**
- Screenshot showing progress at 100%
- Should show: Progress bar at 100%, Status = "Returning"

---

### Test Scenario 4: Stop Robot and Return to Base

**Steps:**
1. Deploy the robot (if not already deployed)
2. Click the "Stop Robot" button
3. Observe:
   - Robot status should change to "Returning"
   - Location should show "Returning..."
   - After 3 seconds, status should change to "Idle"
   - Location should change to "Home Base"
   - Toast notification: "Robot returned to base"

**Screenshot to Capture:**
- Screenshot showing robot back at "Home Base"
- Should show: Status = "Idle", Location = "Home Base"

---

## Step 3: Capture Console Logs

### Open Browser Developer Tools

1. **Press F12** or **Right-click → Inspect**
2. **Go to the "Console" tab**
3. **Clear the console** (click the clear button or press Ctrl+L)

### What to Look For

**Good Signs (No Errors):**
- No red error messages
- No warnings about invalid values
- Application loads without errors

**If Environment Variables Are Set:**
- You might see warnings if invalid values are provided
- These warnings should be handled gracefully (our code does this)

### Capture Console Log

**Option A: Screenshot**
- Take a screenshot of the console showing no errors

**Option B: Copy Text**
1. Right-click in the console
2. Select "Save as..." or copy all text
3. Save to a file: `console-log.txt`

---

## Step 4: Verify Constants Are Working

### Check in Browser DevTools

1. **Open DevTools (F12)**
2. **Go to "Sources" or "Debugger" tab**
3. **Navigate to:** `src/lib/constants.ts`
4. **Verify you can see:**
   - `ROBOT_STATUS` object
   - `DEPLOY_STATE` object
   - `LOCATIONS` object

### Check in Browser DevTools - Network Tab

1. **Open DevTools (F12)**
2. **Go to "Network" tab**
3. **Reload the page**
4. **Verify:** No 404 errors for constants or config files

---

## Step 5: Test Environment Variable Override (Optional)

### Create `.env` File

1. **Create a file named `.env`** in the project root
2. **Add test values:**
   ```env
   VITE_DEPLOY_TIMEOUT_MS=5000
   VITE_BATTERY_LOW_THRESHOLD=15
   VITE_CLEANING_INTERVAL_MS=1000
   ```

3. **Restart the dev server:**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

4. **Test:**
   - Deploy robot → should take 5 seconds instead of 2
   - Battery threshold → should return at 15% instead of 20%
   - Cleaning updates → should update every 1 second instead of 2

**Screenshot to Capture:**
- Console showing no errors with custom environment variables

---

## Step 6: What Evidence to Submit

### Required Evidence:

1. **Screenshot 1: Robot in "Cleaning" State**
   - Shows: Status = "Cleaning", Location = "Zone A - North Side"
   - File name: `screenshot-cleaning-state.png`

2. **Screenshot 2: Low Battery Warning**
   - Shows: Battery ≤ 20%, Status = "Returning", Location = "Returning (Low Battery)"
   - File name: `screenshot-low-battery.png`

3. **Screenshot 3: Robot at Home Base**
   - Shows: Status = "Idle", Location = "Home Base"
   - File name: `screenshot-home-base.png`

4. **Console Log: No Errors**
   - Screenshot or text file showing console with no errors
   - File name: `console-log.png` or `console-log.txt`

### Optional Evidence:

5. **Screenshot: Environment Variable Test**
   - Shows console with custom environment variables working
   - File name: `screenshot-env-vars.png`

---

## How to Take Screenshots

### Windows:

1. **Full Screen:**
   - Press `Windows + Shift + S` (Snipping Tool)
   - Select area to capture
   - Screenshot saved to clipboard

2. **Active Window:**
   - Press `Alt + Print Screen`
   - Paste into Paint or image editor
   - Save as PNG

3. **Browser Extension:**
   - Install "Awesome Screenshot" or similar
   - Click extension icon
   - Select area to capture

### Mac:

1. **Full Screen:**
   - Press `Command + Shift + 3`

2. **Selected Area:**
   - Press `Command + Shift + 4`
   - Drag to select area

3. **Screenshots saved to Desktop**

---

## Troubleshooting

### If `npm run dev` doesn't work:

1. **Check Node.js is installed:**
   ```bash
   node --version
   ```
   Should show v18 or higher

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### If the app doesn't load:

1. **Check the terminal for errors**
2. **Check browser console (F12) for errors**
3. **Verify port 8080 is not in use**

### If constants aren't working:

1. **Check browser console for import errors**
2. **Verify files exist:**
   - `src/lib/constants.ts`
   - `src/lib/config.ts`
3. **Check for TypeScript errors in terminal**

---

## Quick Test Checklist

- [ ] Dev server starts without errors
- [ ] Application loads in browser
- [ ] No console errors
- [ ] "Deploy Robot" button works
- [ ] Robot status changes to "Cleaning"
- [ ] Location changes to "Zone A - North Side"
- [ ] Battery depletes over time
- [ ] Low battery warning appears at 20%
- [ ] Robot returns to "Home Base"
- [ ] "Stop Robot" button works
- [ ] All screenshots captured

---

## Example Evidence File Structure

```
execution-evidence/
├── screenshot-cleaning-state.png
├── screenshot-low-battery.png
├── screenshot-home-base.png
├── console-log.png
└── README.md (brief description of each screenshot)
```

---

*Guide created: January 22, 2026*  
*For Task 1.3: Extract Constants and Configuration*
