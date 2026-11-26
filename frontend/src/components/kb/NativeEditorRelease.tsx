export default function NativeEditorRelease({locale='en'}:{locale?:string}) {
 const ru=locale==='ru';
 return <section className="tk-evidence" data-native-release="1.140.07216" lang={ru?'ru':'en'}>
 <h2>Tvijo Code 1.140.07216</h2><p>2026-11-14 · DSHREM 0.10.28 · {ru?'Предварительный выпуск':'Pre-release'}</p>
 <p>{ru?'Windows x64, macOS Apple silicon и Intel, Linux x64.':'Windows x64, macOS Apple silicon and Intel, Linux x64.'}</p>
 <p><strong>{ru?'Не проверено: вход, платные задания, нотаризация macOS и доверие к подписи Windows. Пакетных установщиков Linux нет.':'Not verified: sign-in, paid tasks, macOS notarization and Windows publisher trust. Linux package installers are not included.'}</strong></p>
 <p><a href="https://dsh.tvijo.com/download#windows">Windows</a> · <a href="https://dsh.tvijo.com/download#macos">macOS</a> · <a href="https://dsh.tvijo.com/download#linux">Linux</a> · <a href="https://dsh.tvijo.com/download#vscode">VS Code</a></p>
 <p><a href={'/wiki/'+(ru?'ru/':'')+'tvijo-code-07216-native-release/'}>{ru?'Установка и проверка SHA-256':'Installation and SHA-256 verification'}</a></p>
 <p><a href="https://github.com/nikbibamon/tvijocode/releases/download/1.140.07216/BUILD_RECEIPT.json">{ru?'Квитанция сборки':'Build receipt'}</a></p>
 </section>;
}
