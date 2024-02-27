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
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Pattern;

import static java.net.HttpURLConnection.HTTP_OK;

public class ESPNRosterReader {

    public static void main(String[] args) throws IOException {

       // String[] sports = {  "mlb", "nhl", "nfl","nba"};
        String[] sports = {  "nba"};
        Map<String,String> headers = Map.of("mlb",
                "Team_Code,Team_Name,Player_Name,Player_No,Position,Bat,Throws,Age,Height,Weight,HomeTown_City,HomeTown_ST_COUNTRY",
                "nhl",
                "Team_Code,Team_Name,Player_Name,Player_No,Age,Height,Weight,Shot,,HomeTown_City,HomeTown_ST_COUNTRY, BirthDate",
                "nfl",
                "Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,Years_Experience,College",
                "nba",
                "Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,College,Salary");

       // String[] sports = {"nfl"};
        for (String sport : sports) {

            try {

                Path path = Paths.get(sport + "rosters.csv");
                Files.deleteIfExists(path);
                Files.createFile(path);
                writeData(path,headers.get(sport));

                String[] teamNames = Files.lines(Paths.get("teams.csv"))
                        .filter((s) -> s.startsWith(sport))
                        .map((s) -> s.split(","))
                        .map((s) -> {
                            String urlTeamName=s[1].toLowerCase().replaceAll(" ", "-");
                            String urlTeamCode=
                            (s.length == 4
                                    ? s[3].toLowerCase() :
                            ("nba_mlb".contains(sport)
                                    ? s[1].substring(0, 3).toLowerCase() :
                                    s[2].toLowerCase()));
                            return urlTeamCode+"_"+urlTeamName;
                        }).toArray(String[]::new);
                Arrays.sort(teamNames);
                HttpClient client = HttpClient.newHttpClient();

                //String[] teamNames = {"CIN_cincinnati-bengals"};
                for (String team : teamNames) {
                    URL url = new URL("https://www.espn.com/%s/team/roster/_/name/%s/%s"
                            .formatted(sport, team.substring(0, team.indexOf("_")), team.substring(team.indexOf("_") + 1)));
                    System.out.println(url);
                    ;
                    HttpRequest request = HttpRequest.newBuilder()
                            .GET()
                            .uri(url.toURI())
                            .build();
                    HttpResponse<String> response = client.send(request,
                            HttpResponse.BodyHandlers.ofString());
                    if (response.statusCode() != HTTP_OK) {
                        System.out.println("Error reading web page " + url);
                        return;
                    }

                    Pattern tdpattern = Pattern.compile("<td.*?>(.*?)</td>");

                    tdpattern.matcher(response.body())
                            .results()
                            .map(matchResult -> matchResult.group(1))
                            .map(s -> s.replaceAll("<[^>]*>", "-").strip())
                            .map(s -> s.replaceAll("&#x27;", "'"))
                            .map(s -> s.replaceAll("&quot;", "\""))
                            .map(s -> s.replaceAll("&amp;", "&"))
                            .map(s -> s.replaceAll(", ", ","))
                            .map(s -> s.replaceAll("--", ","))
                            .map(s -> (s.startsWith(",") ? s.substring(1) : s))
                            .map(s -> (s.endsWith(",") ? s.substring(0, s.length() - 1) : s))
                            .forEach((val) -> {
                                    if (val.strip().equals(",,,,,-")) {
                                        writeData(path,"\n" + team.replace("_", ",") + ",");
                                    } else {
                                        writeData(path, val.replaceAll("-", "") + ",");
                                    }
                            });
                  //  Thread.sleep(500);
                }
            } catch (IOException | URISyntaxException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static void writeData(Path path, String val)  {

            try {
                Files.writeString(path, val, StandardOpenOption.APPEND);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

    }
}
