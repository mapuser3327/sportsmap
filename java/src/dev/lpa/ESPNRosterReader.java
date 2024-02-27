package dev.lpa;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.regex.Pattern;

import static java.net.HttpURLConnection.HTTP_OK;

public class ESPNRosterReader {

    public static void main(String[] args) throws IOException {

        //String[] sports = {"nfl", "nba", "mlb", "nhl"};
        String[] sports = { "nhl"};
        for (String sport : sports) {
        try {

                Path path = Paths.get(sport + "rosters.csv");
                Files.deleteIfExists(path);
                Files.createFile(path);
                String[] teamNames = Files.lines(Paths.get("teams.csv"))
                        .filter((s) -> s.startsWith(sport))
                        .map((s) -> s.split(","))
                        .map((s)-> (s.length==4?s[3]:s[2])+"_"+s[1].toLowerCase().replaceAll(" ","-"))
                        .toArray(String[]::new);

                HttpClient client = HttpClient.newHttpClient();

                //String[] teamNames = {"chw_chicago-white-sox"};
                for (String team : teamNames) {
                    URL url = new URL("https://www.espn.com/%s/team/roster/_/name/%s/%s"
                            .formatted(sport, team.substring(0, team.indexOf("_")), team.substring(team.indexOf("_") + 1)));
                    System.out.println(url);
                    HttpRequest request = HttpRequest.newBuilder()
                            .GET()
                            .uri(url.toURI())
                            .build();
                    HttpResponse<String> response = client.send(request,
                            HttpResponse.BodyHandlers.ofString());
                    //            HttpResponse<Stream<String>> response = client.send(request,
                    //                    HttpResponse.BodyHandlers.ofLines());

                    //            HttpResponse<Path> response = client.send(request,
                    //            HttpResponse.BodyHandlers.ofFile(Path.of("celticsRoster.html")));
                    if (response.statusCode() != HTTP_OK) {
                        System.out.println("Error reading web page " + url);
                        return;
                    }

                    Pattern pattern = Pattern.compile("<tr.*?>(.*?)</tr>");
                    Pattern tdpattern = Pattern.compile("<td.*?>(.*?)</td>");

                    // Get a stream of matched rows
                    tdpattern.matcher(response.body())
                            .results()
                            .map(matchResult -> matchResult.group(1))
                            .map(s -> s.replaceAll("<[^>]*>", "-").strip())
                            .map(s -> s.replaceAll("&#x27; ", "'"))
                            .map(s -> s.replaceAll("&quot;", "\""))
                            .map(s -> s.replaceAll(", ", ","))
                            .map(s -> s.replaceAll("--", ","))
                            .map(s -> (s.startsWith(",") ? s.substring(1) : s))
                            .map(s -> (s.endsWith(",") ? s.substring(0, s.length() - 1) : s))
                            //
                            //                                                .forEach((val) ->{
                            //                                                    if (val.strip().equals(",,,,,-")) System.out.print("\n"+team+",");
                            //                                                    else System.out.print(val.replaceAll("-","") +",");
                            //                                                });
                            .forEach((val) -> {
                                if (val.strip().equals(",,,,,-")) {
                                    try {
                                        Files.writeString(path, "\n" + team.replace("_", ",") + ",",
                                                StandardOpenOption.APPEND);
                                    } catch (IOException e) {
                                        throw new RuntimeException(e);
                                    }
                                } else {
                                    try {
                                        Files.writeString(path, val.replaceAll("-", "") + ",",
                                                StandardOpenOption.APPEND);
                                    } catch (IOException e) {
                                        throw new RuntimeException(e);
                                    }
                                }
                            });
                Thread.sleep(500);
                }
            } catch(IOException | URISyntaxException | InterruptedException e){
                throw new RuntimeException(e);
            }
        }
      }// end main method
    } // end HttpClientGet
