import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter, butter

SR = 44100
DUR = 30.0

def generate_audio():
    t_full = np.linspace(0, DUR, int(SR * DUR), endpoint=False)
    
    t_tense_dur = 22.0
    n_tense = int(t_tense_dur * SR)
    t_tense = t_full[:n_tense]
    
    t_rel_dur = DUR - t_tense_dur
    n_rel = int(t_rel_dur * SR)
    t_rel = t_full[n_tense:] - 22.0
    
    # ---------------------------------------------
    # 1. RISING TENSION (0s - 22s)
    # ---------------------------------------------
    
    # Thick detuned sub-bass drone
    # Sine at 40Hz
    drone_sine = np.sin(2 * np.pi * 40 * t_tense)
    # Sawtooth at 40.5Hz (approximated by summing harmonics)
    drone_saw = 0
    for k in range(1, 10):
        drone_saw += (1.0 / k) * np.sin(2 * np.pi * (40.5 * k) * t_tense)
    
    # Low pass filter the saw at 150Hz
    b, a = butter(2, 150 / (SR / 2), btype='low')
    drone_saw_lp = lfilter(b, a, drone_saw)
    
    sub_drone = (drone_sine * 0.6 + drone_saw_lp * 0.4) * 0.5
    
    # Shepard tone / Exponential sweep
    # We integrate frequency to get phase: phase = int f(t) dt
    # f(t) = 100 * (20 ** (t / 22))
    # phase(t) = 100 * (22 / ln(20)) * (20 ** (t / 22) - 1)
    phase_sweep = 100 * (22 / np.log(20)) * (20 ** (t_tense / 22) - 1)
    sweep_osc = np.sin(2 * np.pi * phase_sweep)
    
    # LFO pulsing siren texture (e.g. 8Hz pulse that gets faster)
    lfo_freq = 4 + 8 * (t_tense / 22)
    lfo_phase = 2 * np.pi * lfo_freq * t_tense
    lfo = 0.2 + 0.8 * (0.5 + 0.5 * np.sin(lfo_phase))
    
    siren = sweep_osc * lfo * 0.3 * (t_tense / 22)
    
    # Filtered white noise rising in volume
    noise = np.random.normal(0, 1, n_tense)
    # Rising cutoff filter
    # To do a time-varying filter efficiently in numpy without frame-by-frame processing, 
    # we can use a very simple leaky integrator where the leak depends on time, 
    # but for simplicity let's just heavily lowpass and increase volume
    b_noise, a_noise = butter(2, 1000 / (SR / 2), btype='low')
    noise_filtered = lfilter(b_noise, a_noise, noise)
    noise_env = (t_tense / 22) ** 2 * 0.15
    noise_layer = noise_filtered * noise_env
    
    tension_audio = sub_drone + siren + noise_layer
    
    # ---------------------------------------------
    # 2. RESOLUTION DROP (22s - 30s)
    # ---------------------------------------------
    
    # Massive synthesized sub-kick
    # Pitch envelope drops from 150 to 30 in 0.5s
    # freq(t) = 30 + 120 * exp(-t / 0.1)
    # phase(t) = 30*t + 120 * (-0.1) * exp(-t / 0.1) - 120*(-0.1)
    kick_phase = 30 * t_rel - 12 * np.exp(-t_rel / 0.1) + 12
    kick = np.sin(2 * np.pi * kick_phase)
    # Amp envelope for kick
    kick_amp = np.exp(-t_rel / 0.3)
    kick_layer = kick * kick_amp * 1.0
    
    # Lush cinematic pad (C minor 9 resolving to C major? Or just a huge C major)
    # C Major: C3(130.81), E3(164.81), G3(196.00), C4(261.63)
    # We will use slightly detuned saws for a rich pad, then lowpass filter it.
    pad_freqs = [130.81, 164.81, 196.00, 261.63]
    pad_layer = np.zeros(n_rel)
    
    pad_env = np.clip(t_rel * 2, 0, 1) * np.clip(1.0 - (t_rel - 6) / 2.0, 0, 1)
    
    for f in pad_freqs:
        for detune in [-0.5, 0, 0.5]:
            f_detuned = f + detune
            # Sawtooth approximation
            for k in range(1, 6):
                pad_layer += (1.0 / k) * np.sin(2 * np.pi * (f_detuned * k) * t_rel)
                
    # Lowpass filter the pad to make it lush
    b_pad, a_pad = butter(2, 600 / (SR / 2), btype='low')
    pad_layer = lfilter(b_pad, a_pad, pad_layer)
    pad_layer = pad_layer * 0.05 * pad_env
    
    release_audio = kick_layer + pad_layer
    
    # ---------------------------------------------
    # 3. ASSEMBLY & ALGORITHMIC REVERB
    # ---------------------------------------------
    
    audio_full = np.concatenate([tension_audio, release_audio])
    
    # Basic algorithmic delay/reverb (Feedback Delay Network approximation)
    # We'll use a few parallel delays with feedback and decay
    delay_times = [0.15, 0.22, 0.33, 0.45] # seconds
    decays = [0.4, 0.3, 0.2, 0.1]
    
    reverb_layer = np.zeros(len(audio_full))
    for d, decay in zip(delay_times, decays):
        delay_samples = int(d * SR)
        wet = np.zeros(len(audio_full))
        # Simple feedforward delay for brevity and speed
        wet[delay_samples:] = audio_full[:-delay_samples] * decay
        reverb_layer += wet
        
    audio_full += reverb_layer * 0.5
    
    # ---------------------------------------------
    # 4. MASTERING
    # ---------------------------------------------
    
    # Normalize
    audio_full /= np.max(np.abs(audio_full))
    
    # Soft clipping
    drive = 1.5
    audio_full = np.tanh(audio_full * drive)
    
    # Final normalization and export
    audio_full /= np.max(np.abs(audio_full))
    
    # Convert to 16-bit PCM
    audio_pcm = np.int16(audio_full * 32767)
    
    wavfile.write('docs/animation-builder/audio.wav', SR, audio_pcm)
    print("Cinematic audio generated successfully using scipy/numpy!")

if __name__ == '__main__':
    generate_audio()
