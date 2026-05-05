import SwiftUI
import WebKit

struct ContentView: View {
    @State private var page = WebPage()

    var body: some View {
        ZStack(alignment: .top) {
            WebView(page)
                .ignoresSafeArea()
                .onAppear {
                    page.load(URLRequest(url: URL(string: "http://localhost:3000/ipod")!))
                }

            Color.clear
                .frame(height: 200)
                .contentShape(Rectangle())
                .gesture(WindowDragGesture())
        }
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
    }
}
