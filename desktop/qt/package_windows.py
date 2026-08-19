import os
import shutil
import subprocess

def package():
    build_dir = "build"
    dist_dir = "dist_windows"
    
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir)

    print("Building project...")
    subprocess.run(["cmake", "-B", build_dir, "-DCMAKE_BUILD_TYPE=Release"])
    subprocess.run(["cmake", "--build", build_dir, "--config", "Release"])

    # Binary names
    exe_name = "appDungeonEditor.exe"
    dll_name = "core.dll"
    
    # Copy main binaries
    shutil.copy(os.path.join(build_dir, "Release", exe_name), dist_dir)
    shutil.copy(os.path.join(build_dir, "Release", dll_name), dist_dir)

    print("Running windeployqt to bundle dependencies into core architecture...")
    # windeployqt will gather all necessary Qt DLLs and plugins
    # We point it at our main exe
    subprocess.run(["windeployqt", "--release", "--no-translations", "--no-opengl-sw", 
                    os.path.join(dist_dir, exe_name)])

    print(f"Windows distribution ready in {dist_dir}")
    print("Architecture: appDungeonEditor.exe -> core.dll -> [Qt Bundled Deps]")

if __name__ == "__main__":
    package()
