package com.company.product.api.seed;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile({"default", "dev", "test"})
public class SeedDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        writeUsersFile();
    }

    private void writeUsersFile() throws IOException {
        Path output = Path.of("users.txt");
        List<String> lines = List.of(
                "email=admin79@school.local; password=Admin123!; role=ADMIN",
                "email=librarian79@school.local; password=Lib123!; role=LIBRARIAN",
                "email=reader79@school.local; password=Read123!; role=READER",
                "email=teacher79@school.local; password=Read123!; role=READER"
        );
        Files.write(output, lines);
    }
}
