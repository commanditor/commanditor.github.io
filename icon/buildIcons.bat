@echo off

rem https://inkscape.org/sk/doc/inkscape-man.html

set INKSCAPE=C:\Program Files\Inkscape\Inkscape.exe
set SVGICON_FILENAME=%cd%\commanditor.svg
set EXPORT_DIR=%cd%\
set SIZES=(256 192 128 64 32 24 16)

if exist "%INKSCAPE%" (
    echo Inkscape:        %INKSCAPE%
) else (
    echo Inkscape:        not found!!!
)

if exist "%SVGICON_FILENAME%" (
    echo SVG-Icon Source: %SVGICON_FILENAME%
) else (
    echo SVG-Icon Source: not found!!!
)

echo PNG-Export Dir:  %EXPORT_DIR%
echo File Example:    %EXPORT_DIR%iconXXX.png
echo Sizes:           %SIZES%
echo.

if exist %INKSCAPE% (
    if exist %SVGICON_FILENAME% (
        echo will now create icons in specified sizes
        rem pause
        echo.

        for %%i in %SIZES% do (
            echo creating icon %%i*%%i
            "%INKSCAPE%" -f "%SVGICON_FILENAME%" -C --export-png="%EXPORT_DIR%icon%%i.png" --export-width=%%i --export-height=%%i
        )

        echo.
        echo export completed
        goto end
    )
)

echo cannot create icons without Inkscape and/or source icon.

:end
rem pause
